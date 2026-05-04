import { nanoid } from "nanoid";
import { eq, and, sql } from "drizzle-orm";
import { db, weeklySimulationResults, recurringEdges, weeklyRuns } from "@/db";

/**
 * Recompute the recurring_edges aggregation for an event from scratch.
 * Called after each cron tick. Idempotent — full delete + reinsert keeps
 * us safe from double-counting if a tick partially failed and re-ran.
 *
 * Aggregation grain: (fight_id, bet_type, label).
 *
 * Definitions (per strategy doc Section 6):
 *   appearance_pct = appearances / total_runs
 *   appearances    = count of result rows for this (fight, bet_type, label)
 *   total_runs     = total number of ticks the run has executed for this event
 *
 * NOTE: a "result" being persisted means MAFS picked it during that tick —
 * if the tick produced different label for the same fight (e.g. flipped from
 * Chimaev ML to Strickland ML), each label gets its own row and its own
 * appearance count. Tier classification then uses appearance_pct directly.
 */
export async function aggregateRecurringEdges(eventId: string): Promise<void> {
  // Get the run for this event (we'll typically only have one running at a time).
  const [run] = await db
    .select()
    .from(weeklyRuns)
    .where(and(eq(weeklyRuns.eventId, eventId), eq(weeklyRuns.status, "running")))
    .limit(1);

  if (!run) return;

  const totalRuns = run.tickCount;
  if (totalRuns === 0) return;

  // Pull all result rows for this run, group in JS (small N — at most a few
  // hundred rows per event per week, fits in memory cheaply).
  const rows = await db
    .select()
    .from(weeklySimulationResults)
    .where(eq(weeklySimulationResults.weeklyRunId, run.id));

  type Key = string;
  type Bucket = {
    fightId: string;
    betType: string;
    label: string;
    weightClass: string | null;
    edges: number[];
    modelProbs: number[];
    latestMarketOdd: number | null;
    appearances: number;
  };

  const buckets = new Map<Key, Bucket>();
  for (const r of rows) {
    const key = `${r.fightId}::${r.betType}::${r.label}`;
    let b = buckets.get(key);
    if (!b) {
      b = {
        fightId: r.fightId,
        betType: r.betType,
        label: r.label,
        weightClass: r.weightClass,
        edges: [],
        modelProbs: [],
        latestMarketOdd: null,
        appearances: 0,
      };
      buckets.set(key, b);
    }
    b.appearances += 1;
    if (typeof r.edgePct === "number") b.edges.push(r.edgePct);
    if (typeof r.modelProb === "number") b.modelProbs.push(r.modelProb);
    if (typeof r.marketOddAtRun === "number") b.latestMarketOdd = r.marketOddAtRun;
  }

  const newRows = [...buckets.values()].map((b) => {
    const avgEdge = b.edges.length ? b.edges.reduce((s, x) => s + x, 0) / b.edges.length : 0;
    const sortedEdges = [...b.edges].sort((a, b) => a - b);
    const median = sortedEdges.length
      ? (sortedEdges[Math.floor(sortedEdges.length / 2)] +
          sortedEdges[Math.ceil(sortedEdges.length / 2) - 1]) /
        2
      : 0;
    const variance =
      b.edges.length > 1
        ? b.edges.reduce((s, x) => s + (x - avgEdge) ** 2, 0) / (b.edges.length - 1)
        : 0;
    const stddev = Math.sqrt(variance);
    const avgProb = b.modelProbs.length
      ? b.modelProbs.reduce((s, x) => s + x, 0) / b.modelProbs.length
      : 0;

    return {
      id: nanoid(),
      eventId,
      fightId: b.fightId,
      betType: b.betType,
      label: b.label,
      appearances: b.appearances,
      totalRuns,
      appearancePct: b.appearances / totalRuns,
      avgEdge,
      medianEdge: median,
      edgeStability: stddev,
      avgModelProb: avgProb,
      latestMarketOdd: b.latestMarketOdd,
      weightClass: b.weightClass,
    };
  });

  // Replace existing aggregations for this event atomically.
  await db.transaction(async (tx) => {
    await tx.delete(recurringEdges).where(eq(recurringEdges.eventId, eventId));
    if (newRows.length) {
      await tx.insert(recurringEdges).values(newRows);
    }
  });
}

/**
 * Helper: top recurring edges across an event sorted by appearance_pct desc.
 * Used by Phase 3 (card builder) and Phase 4 (retention emails).
 */
export async function getTopRecurringEdges(eventId: string, minAppearance = 0.6, limit = 50) {
  return db
    .select()
    .from(recurringEdges)
    .where(and(eq(recurringEdges.eventId, eventId), sql`${recurringEdges.appearancePct} >= ${minAppearance}`))
    .orderBy(sql`${recurringEdges.appearancePct} desc`)
    .limit(limit);
}
