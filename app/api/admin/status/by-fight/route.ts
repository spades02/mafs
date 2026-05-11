import { NextRequest, NextResponse } from "next/server";
import { desc, eq, gt, inArray, sql } from "drizzle-orm";
import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";
import {
  db,
  events,
  weeklyRuns,
  weeklySimulationResults,
  fights,
  fighters,
} from "@/db";

export const runtime = "nodejs";

/**
 * Admin-only per-fight summary of the weekly-sim work for a given run.
 * Collapses raw weeklySimulationResults into one row per (fight × betType ×
 * label) with min/max/median/avg/latest model probability and edge across
 * all ticks. Designed for client-facing transparency — "here is the work
 * the system did on each fight this week" — not for raw row dumping.
 *
 * Auth: same admin gate as /api/admin/status.
 *
 * Usage:
 *   GET /api/admin/status/by-fight                — most recent run for next event
 *   GET /api/admin/status/by-fight?runId=...      — explicit run id
 *   GET /api/admin/status/by-fight?eventId=...    — most recent run for an event
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminIds = (process.env.MAFS_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!adminIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden — not an admin" }, { status: 403 });
  }

  const url = new URL(req.url);
  let runId = url.searchParams.get("runId");
  const eventIdParam = url.searchParams.get("eventId");

  // Resolve runId when not given explicitly.
  if (!runId) {
    let targetEventId = eventIdParam;
    if (!targetEventId) {
      const [nextEvent] = await db
        .select({ eventId: events.eventId })
        .from(events)
        .where(gt(events.dateTime, new Date()))
        .orderBy(events.dateTime)
        .limit(1);
      targetEventId = nextEvent?.eventId ?? null;
    }
    if (!targetEventId) {
      return NextResponse.json(
        { error: "No runId/eventId given and no upcoming event found" },
        { status: 404 },
      );
    }
    const [latestRun] = await db
      .select()
      .from(weeklyRuns)
      .where(eq(weeklyRuns.eventId, targetEventId))
      .orderBy(desc(weeklyRuns.startedAt))
      .limit(1);
    if (!latestRun) {
      return NextResponse.json(
        { error: `No weekly run found for event ${targetEventId}` },
        { status: 404 },
      );
    }
    runId = latestRun.id;
  }

  // Run metadata (also used to surface eventId in the response).
  const [run] = await db
    .select()
    .from(weeklyRuns)
    .where(eq(weeklyRuns.id, runId))
    .limit(1);
  if (!run) {
    return NextResponse.json({ error: `Run ${runId} not found` }, { status: 404 });
  }

  // Canonicalize GTD / DGTD labels at query time. Mirrors the JS function
  // in lib/weekly-sims/normalize-label.ts — keep them in sync.
  const canonicalLabel = sql<string>`CASE
    WHEN ${weeklySimulationResults.betType} = 'GTD' THEN 'Fight Goes The Distance'
    WHEN ${weeklySimulationResults.betType} = 'DGTD' THEN 'Fight Doesn''t Go The Distance'
    ELSE trim(${weeklySimulationResults.label})
  END`;

  // Aggregate per (fightId, betType, canonical label). Median + latest-by-tick
  // use Postgres-native percentile_cont and array_agg(... order by ...).
  const aggregates = await db
    .select({
      fightId: weeklySimulationResults.fightId,
      betType: weeklySimulationResults.betType,
      label: canonicalLabel,
      weightClass: weeklySimulationResults.weightClass,
      ticks: sql<number>`count(*)::int`,
      minProb: sql<number>`min(${weeklySimulationResults.modelProb})`,
      maxProb: sql<number>`max(${weeklySimulationResults.modelProb})`,
      avgProb: sql<number>`avg(${weeklySimulationResults.modelProb})`,
      medianProb: sql<number>`percentile_cont(0.5) within group (order by ${weeklySimulationResults.modelProb})`,
      avgEdge: sql<number | null>`avg(${weeklySimulationResults.edgePct})`,
      medianEdge: sql<
        number | null
      >`percentile_cont(0.5) within group (order by ${weeklySimulationResults.edgePct})`,
      latestModelProb: sql<
        number
      >`(array_agg(${weeklySimulationResults.modelProb} order by ${weeklySimulationResults.tickIndex} desc))[1]`,
      latestEdgePct: sql<
        number | null
      >`(array_agg(${weeklySimulationResults.edgePct} order by ${weeklySimulationResults.tickIndex} desc))[1]`,
      latestMarketOdd: sql<
        number | null
      >`(array_agg(${weeklySimulationResults.marketOddAtRun} order by ${weeklySimulationResults.tickIndex} desc))[1]`,
    })
    .from(weeklySimulationResults)
    .where(eq(weeklySimulationResults.weeklyRunId, runId))
    .groupBy(
      weeklySimulationResults.fightId,
      weeklySimulationResults.betType,
      canonicalLabel,
      weeklySimulationResults.weightClass,
    );

  // Load fight + fighter metadata in two batched queries.
  const fightIds = Array.from(new Set(aggregates.map((a) => a.fightId)));
  const fightRows = fightIds.length
    ? await db.select().from(fights).where(inArray(fights.id, fightIds))
    : [];

  const fighterIds = new Set<string>();
  for (const f of fightRows) {
    if (f.fighterAId) fighterIds.add(f.fighterAId);
    if (f.fighterBId) fighterIds.add(f.fighterBId);
  }
  const fighterRows = fighterIds.size
    ? await db
        .select({
          id: fighters.id,
          firstName: fighters.firstName,
          lastName: fighters.lastName,
        })
        .from(fighters)
        .where(inArray(fighters.id, Array.from(fighterIds)))
    : [];

  const fighterMap = new Map(fighterRows.map((f) => [f.id, f]));
  const fightMap = new Map(fightRows.map((f) => [f.id, f]));

  const fighterName = (id: string | null) => {
    if (!id) return null;
    const f = fighterMap.get(id);
    if (!f) return null;
    return [f.firstName, f.lastName].filter(Boolean).join(" ") || null;
  };

  // Group aggregates by fightId; sort labels by latest edge desc (best on top).
  const grouped = new Map<string, typeof aggregates>();
  for (const a of aggregates) {
    const list = grouped.get(a.fightId) ?? [];
    list.push(a);
    grouped.set(a.fightId, list);
  }

  const fightsOut = Array.from(grouped.entries()).map(([fightId, labels]) => {
    const fightMeta = fightMap.get(fightId);
    labels.sort((a, b) => (b.latestEdgePct ?? -Infinity) - (a.latestEdgePct ?? -Infinity));
    return {
      fightId,
      fighterA: fighterName(fightMeta?.fighterAId ?? null),
      fighterB: fighterName(fightMeta?.fighterBId ?? null),
      weightClass: fightMeta?.weightClass ?? labels[0]?.weightClass ?? null,
      labelCount: labels.length,
      totalTicks: labels.reduce((sum, l) => sum + (l.ticks ?? 0), 0),
      labels: labels.map((l) => ({
        betType: l.betType,
        label: l.label,
        ticks: l.ticks,
        modelProb: {
          min: l.minProb,
          max: l.maxProb,
          avg: l.avgProb,
          median: l.medianProb,
          latest: l.latestModelProb,
        },
        edge: {
          avg: l.avgEdge,
          median: l.medianEdge,
          latest: l.latestEdgePct,
        },
        latestMarketOdd: l.latestMarketOdd,
      })),
    };
  });

  // Sort fights by their best (highest) latest edge so the most interesting
  // matchups float to the top of the response.
  fightsOut.sort((a, b) => {
    const aBest = a.labels[0]?.edge.latest ?? -Infinity;
    const bBest = b.labels[0]?.edge.latest ?? -Infinity;
    return bBest - aBest;
  });

  return NextResponse.json({
    runId,
    eventId: run.eventId,
    run: {
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      tickCount: run.tickCount,
      totalFightsSimulated: run.totalFightsSimulated,
      targetSims: run.targetSims,
      totalCostUsd: run.totalCostUsd,
    },
    fightCount: fightsOut.length,
    fights: fightsOut,
  });
}
