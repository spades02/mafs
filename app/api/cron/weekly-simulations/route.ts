import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq, and, desc, sql, gt, lt, inArray } from "drizzle-orm";
import {
  db,
  events,
  fights,
  fighters,
  weeklyRuns,
  weeklySimulationResults,
  recurringEdges,
} from "@/db";
import Agents, { FightResult, SimplifiedEvent, AgentUsageReport } from "@/app/ai/agents/agents";
import { bucketForDate, TICK_TARGETS, modelForTick } from "@/lib/weekly-sims/schedule";
import { estimateCostUsd, logLlmSpend } from "@/lib/weekly-sims/cost-monitor";
import { aggregateRecurringEdges } from "@/lib/weekly-sims/aggregate";
import { normalizeLabel } from "@/lib/weekly-sims/normalize-label";

// Vercel cron jobs run as serverless functions. This is a long-running task —
// keep within Fluid Compute's 300s default. If a single tick exceeds that we
// chunk by fighting in slices and rely on subsequent ticks to finish.
export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Vercel Cron handler — invoked on schedule (Wed→Sun every 4h ET) once
 * registered in vercel.json. Until that registration is added, this route
 * is callable manually for testing via:
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" $URL/api/cron/weekly-simulations
 *
 * Auth: we rely on Vercel Cron's automatic Authorization header containing
 * `Bearer ${process.env.CRON_SECRET}` — set this env var before enabling.
 *
 * Options (smoke test):
 *   ?ignoreBucket=1   skip the Wed–Sun gate (use from /api/admin/weekly-sim-smoke)
 *   ?eventId=evt_xxx  force-run for a specific event instead of "next upcoming"
 */
export async function GET(req: NextRequest) {
  // Lightweight auth — Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const ignoreBucket = url.searchParams.get("ignoreBucket") === "1";
  const forceEventId = url.searchParams.get("eventId");

  const now = new Date();
  const bucket = bucketForDate(now) ?? "wed";
  const computedBucket = bucketForDate(now);
  if (!ignoreBucket && !computedBucket) {
    return NextResponse.json({ skipped: true, reason: "outside Wed-Sun window" });
  }

  // 0. Close out any "running" rows whose event has already passed. Without
  // this they accumulate forever and confuse the admin dashboard.
  const closedOut = await db
    .update(weeklyRuns)
    .set({ status: "completed", completedAt: now })
    .where(
      and(
        eq(weeklyRuns.status, "running"),
        inArray(
          weeklyRuns.eventId,
          db.select({ eventId: events.eventId }).from(events).where(lt(events.dateTime, now)),
        ),
      ),
    )
    .returning({ id: weeklyRuns.id });
  if (closedOut.length) {
    console.log(`[weekly-sims] closed ${closedOut.length} stale running rows`);
  }

  // 1. Find the next upcoming event, or honor explicit ?eventId override (smoke).
  let evt;
  if (forceEventId) {
    const [forced] = await db
      .select()
      .from(events)
      .where(eq(events.eventId, forceEventId))
      .limit(1);
    if (!forced) {
      return NextResponse.json({ skipped: true, reason: `event ${forceEventId} not found` });
    }
    evt = forced;
  } else {
    const upcoming = await db
      .select()
      .from(events)
      .where(gt(events.dateTime, now))
      .orderBy(events.dateTime)
      .limit(1);
    if (!upcoming[0]) {
      return NextResponse.json({ skipped: true, reason: "no upcoming events" });
    }
    evt = upcoming[0];
  }

  // 2. Get or create the weeklyRuns row for this event.
  const [existingRun] = await db
    .select()
    .from(weeklyRuns)
    .where(and(eq(weeklyRuns.eventId, evt.eventId), eq(weeklyRuns.status, "running")))
    .orderBy(desc(weeklyRuns.startedAt))
    .limit(1);

  const runId = existingRun?.id ?? nanoid();
  const tickIndex = (existingRun?.tickCount ?? 0);
  if (!existingRun) {
    await db.insert(weeklyRuns).values({
      id: runId,
      eventId: evt.eventId,
      status: "running",
      targetSims: 100,
      tickCount: 0,
    });
  }

  // 3. Build SimplifiedEvent shape Agents() expects, from DB.
  const eventFights = await db
    .select()
    .from(fights)
    .where(eq(fights.eventId, evt.eventId));

  const fighterIds = Array.from(
    new Set(
      eventFights.flatMap((f) => [f.fighterAId, f.fighterBId]).filter((x): x is string => Boolean(x)),
    ),
  );
  const fighterRows = fighterIds.length
    ? await db.select().from(fighters).where(inArray(fighters.id, fighterIds))
    : [];
  const fighterById = new Map(fighterRows.map((f) => [f.id, f]));

  const simplifiedEvent: SimplifiedEvent = {
    EventId: evt.eventId,
    Name: evt.name,
    fights: eventFights
      .filter((f) => f.fighterAId && f.fighterBId)
      .map((f) => {
        const a = fighterById.get(f.fighterAId!);
        const b = fighterById.get(f.fighterBId!);
        return {
          id: f.id,
          matchup: `${a?.firstName ?? ""} ${a?.lastName ?? ""} vs ${b?.firstName ?? ""} ${b?.lastName ?? ""}`,
          fighterIds: [f.fighterAId!, f.fighterBId!] as [string, string],
        };
      }),
  };

  if (simplifiedEvent.fights.length === 0) {
    return NextResponse.json({ skipped: true, reason: "no fights with both fighters resolved" });
  }

  // 4. Run agents. We aim for ~100 sims/week distributed by bucket
  // (Wed 10 / Thu 15 / Fri 20 / Sat 40 / Sun 15). Each Agents() call
  // simulates the full event card (~13 fights) once, so per tick we loop
  // ceil(bucketTarget / TICKS_PER_DAY / fightCount) times — capped at 5 to
  // stay within the 300s function budget. A run-level budget cap also
  // skips the LLM once we've reached targetSims for the week.
  const TICKS_PER_DAY = 6;
  const MAX_LOOPS_PER_TICK = 5;
  const targetThisTick = TICK_TARGETS[bucket];
  const fightCount = Math.max(1, simplifiedEvent.fights.length);
  const runTarget = existingRun?.targetSims ?? 100;
  const simsSoFar = existingRun?.totalFightsSimulated ?? 0;
  const remainingBudget = Math.max(0, runTarget - simsSoFar);
  const innerLoops = remainingBudget === 0
    ? 0
    : Math.min(
        MAX_LOOPS_PER_TICK,
        Math.max(1, Math.ceil(targetThisTick / TICKS_PER_DAY / fightCount)),
        Math.ceil(remainingBudget / fightCount),
      );
  const model = modelForTick(tickIndex);
  console.log(
    `[weekly-sims] tick=${tickIndex} bucket=${bucket} target=${targetThisTick} runTarget=${runTarget} simsSoFar=${simsSoFar} loops=${innerLoops} model=${model} event=${evt.name}`,
  );

  const collected: FightResult[] = [];
  const usageEntries: AgentUsageReport[] = [];
  for (let loop = 0; loop < innerLoops; loop++) {
    await Agents(
      simplifiedEvent,
      (update) => {
        if (update.type === "fight") collected.push(update);
      },
      (u) => usageEntries.push(u),
    );
  }

  // 5. Persist per-fight result rows.
  const insertRows = collected.map((r) => {
    const e = r.edge;
    const odd = typeof e.odds_american === "string" ? parseInt(e.odds_american) : e.odds_american;
    const fightWeightClass = eventFights.find((f) => f.id === r.fightId)?.weightClass ?? null;
    return {
      id: nanoid(),
      weeklyRunId: runId,
      fightId: r.fightId,
      betType: e.bet_type,
      label: normalizeLabel(e.bet_type, e.label),
      modelProb: e.P_sim,
      marketImplied: typeof e.P_imp === "number" ? e.P_imp : null,
      edgePct: typeof e.edge_pct === "number" ? e.edge_pct : null,
      ev: typeof e.ev === "number" ? e.ev : null,
      marketOddAtRun: Number.isFinite(odd) ? (odd as number) : null,
      weightClass: fightWeightClass,
      isReusedFromPrior: false,
      tickIndex,
    };
  });

  if (insertRows.length) {
    await db.insert(weeklySimulationResults).values(insertRows);
  }

  // 6. Update tick counter + cost log placeholder. The OpenAI SDK's
  // generateObject call doesn't return token usage in the current code path —
  // logging cost as 0 here; a follow-up task will thread usage through.
  await db
    .update(weeklyRuns)
    .set({
      tickCount: sql`${weeklyRuns.tickCount} + 1`,
      totalFightsSimulated: sql`${weeklyRuns.totalFightsSimulated} + ${insertRows.length}`,
    })
    .where(eq(weeklyRuns.id, runId));

  // Aggregate token usage by model and write spend rows. We may have a mix
  // of models if a future tick switches mid-stream; group accordingly.
  const usageByModel = new Map<string, { input: number; output: number }>();
  for (const u of usageEntries) {
    const cur = usageByModel.get(u.model) ?? { input: 0, output: 0 };
    cur.input += u.inputTokens;
    cur.output += u.outputTokens;
    usageByModel.set(u.model, cur);
  }
  let totalCost = 0;
  for (const [m, tokens] of usageByModel) {
    const cost = estimateCostUsd(m, tokens.input, tokens.output);
    totalCost += cost;
    await logLlmSpend({
      source: "weekly-cron",
      model: m,
      inputTokens: tokens.input,
      outputTokens: tokens.output,
      costUsd: cost,
      weeklyRunId: runId,
    });
  }
  // Update run-level cost tally too
  if (totalCost > 0) {
    await db
      .update(weeklyRuns)
      .set({ totalCostUsd: sql`${weeklyRuns.totalCostUsd} + ${totalCost}` })
      .where(eq(weeklyRuns.id, runId));
  }

  // 7. Recompute aggregations for this event.
  await aggregateRecurringEdges(evt.eventId);

  return NextResponse.json({
    ok: true,
    runId,
    tickIndex,
    bucket,
    fightsSimulated: insertRows.length,
    model,
  });
}
