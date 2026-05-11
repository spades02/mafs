import { redirect } from "next/navigation";
import { count, desc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth/auth";
import {
  db,
  events,
  weeklyRuns,
  calibrationConfigs,
  predictionOutcomes,
  weeklySimulationResults,
  fights,
  fighters,
} from "@/db";
import { AdminStatusClient } from "./admin-status-client";

export const dynamic = "force-dynamic";

const RECALIBRATE_MIN_SAMPLE = 100;

function isAdmin(userId: string): boolean {
  return (process.env.MAFS_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}

export default async function AdminStatusPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");
  if (!isAdmin(session.user.id)) redirect("/dashboard");

  const now = new Date();

  // ── Pipeline status: next event + run + recalibration ──────────
  const [nextEvent] = await db
    .select()
    .from(events)
    .where(gt(events.dateTime, now))
    .orderBy(events.dateTime)
    .limit(1);

  let currentRun: typeof weeklyRuns.$inferSelect | undefined;
  if (nextEvent) {
    const [run] = await db
      .select()
      .from(weeklyRuns)
      .where(eq(weeklyRuns.eventId, nextEvent.eventId))
      .orderBy(desc(weeklyRuns.startedAt))
      .limit(1);
    currentRun = run;
  }

  const [latestConfig] = await db
    .select()
    .from(calibrationConfigs)
    .orderBy(desc(calibrationConfigs.version))
    .limit(1);

  const recentConfigs = await db
    .select({
      version: calibrationConfigs.version,
      computedAt: calibrationConfigs.computedAt,
      sampleSize: calibrationConfigs.sampleSize,
      calibrationScore: calibrationConfigs.calibrationScore,
      isActive: calibrationConfigs.isActive,
    })
    .from(calibrationConfigs)
    .orderBy(desc(calibrationConfigs.version))
    .limit(5);

  const [totalRow] = await db.select({ n: count() }).from(predictionOutcomes);
  const [actionableRow] = await db
    .select({ n: count() })
    .from(predictionOutcomes)
    .where(
      or(eq(predictionOutcomes.outcome, "win"), eq(predictionOutcomes.outcome, "loss")),
    );

  const totalGraded = Number(totalRow?.n ?? 0);
  const actionableGraded = Number(actionableRow?.n ?? 0);

  // ── Per-fight aggregates for currentRun ───────────────────────
  let perFight: Array<{
    fightId: string;
    fighterA: string | null;
    fighterB: string | null;
    weightClass: string | null;
    labelCount: number;
    totalTicks: number;
    labels: Array<{
      betType: string;
      label: string;
      ticks: number;
      modelProb: { min: number; max: number; avg: number; median: number; latest: number };
      edge: { avg: number | null; median: number | null; latest: number | null };
      latestMarketOdd: number | null;
    }>;
  }> = [];

  if (currentRun) {
    // Canonicalize GTD / DGTD labels at query time so historical rows that
    // pre-date the cron-side normalizer still collapse. Keep these branches
    // in sync with lib/weekly-sims/normalize-label.ts.
    const canonicalLabel = sql<string>`CASE
      WHEN ${weeklySimulationResults.betType} = 'GTD' THEN 'Fight Goes The Distance'
      WHEN ${weeklySimulationResults.betType} = 'DGTD' THEN 'Fight Doesn''t Go The Distance'
      ELSE trim(${weeklySimulationResults.label})
    END`;

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
        avgEdge: sql<
          number | null
        >`avg(${weeklySimulationResults.edgePct})`,
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
      .where(eq(weeklySimulationResults.weeklyRunId, currentRun.id))
      .groupBy(
        weeklySimulationResults.fightId,
        weeklySimulationResults.betType,
        canonicalLabel,
        weeklySimulationResults.weightClass,
      );

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
    const fighterName = (id: string | null): string | null => {
      if (!id) return null;
      const f = fighterMap.get(id);
      if (!f) return null;
      return [f.firstName, f.lastName].filter(Boolean).join(" ") || null;
    };

    const grouped = new Map<string, typeof aggregates>();
    for (const a of aggregates) {
      const list = grouped.get(a.fightId) ?? [];
      list.push(a);
      grouped.set(a.fightId, list);
    }

    perFight = Array.from(grouped.entries()).map(([fightId, labels]) => {
      const fightMeta = fightMap.get(fightId);
      labels.sort(
        (a, b) => (b.latestEdgePct ?? -Infinity) - (a.latestEdgePct ?? -Infinity),
      );
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

    perFight.sort((a, b) => {
      const aBest = a.labels[0]?.edge.latest ?? -Infinity;
      const bBest = b.labels[0]?.edge.latest ?? -Infinity;
      return bBest - aBest;
    });
  }

  return (
    <AdminStatusClient
      generatedAt={now.toISOString()}
      nextEvent={
        nextEvent
          ? {
              eventId: nextEvent.eventId,
              name: nextEvent.name,
              dateTime:
                nextEvent.dateTime instanceof Date
                  ? nextEvent.dateTime.toISOString()
                  : String(nextEvent.dateTime),
            }
          : null
      }
      currentRun={
        currentRun
          ? {
              id: currentRun.id,
              status: currentRun.status,
              startedAt:
                currentRun.startedAt instanceof Date
                  ? currentRun.startedAt.toISOString()
                  : String(currentRun.startedAt),
              completedAt:
                currentRun.completedAt instanceof Date
                  ? currentRun.completedAt.toISOString()
                  : currentRun.completedAt
                  ? String(currentRun.completedAt)
                  : null,
              tickCount: currentRun.tickCount,
              totalFightsSimulated: currentRun.totalFightsSimulated,
              targetSims: currentRun.targetSims,
              totalCostUsd: currentRun.totalCostUsd,
            }
          : null
      }
      recalibration={{
        latest: latestConfig
          ? {
              version: latestConfig.version,
              isActive: latestConfig.isActive,
              computedAt:
                latestConfig.computedAt instanceof Date
                  ? latestConfig.computedAt.toISOString()
                  : String(latestConfig.computedAt),
              sampleSize: latestConfig.sampleSize,
              calibrationScore: latestConfig.calibrationScore,
            }
          : null,
        recent: recentConfigs.map((c) => ({
          version: c.version,
          isActive: c.isActive,
          computedAt:
            c.computedAt instanceof Date ? c.computedAt.toISOString() : String(c.computedAt),
          sampleSize: c.sampleSize,
          calibrationScore: c.calibrationScore,
        })),
        graded: {
          total: totalGraded,
          actionable: actionableGraded,
          minSampleNeeded: RECALIBRATE_MIN_SAMPLE,
          canRecalibrateNow: actionableGraded >= RECALIBRATE_MIN_SAMPLE,
        },
      }}
      perFight={perFight}
    />
  );
}
