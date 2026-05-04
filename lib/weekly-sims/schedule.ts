/**
 * Run-frequency schedule per strategy doc + cost optimization plan:
 * front-loaded slightly to seed, back-loaded for line-movement coverage.
 *
 * Buckets are ET day-of-week. The cron itself fires every 4h Wed→Sun;
 * each tick decides how many fights to (re)simulate based on bucket.
 *
 * Total target ≈ 500 sims across the week. The actual number simulated
 * by a tick depends on how many fights had material odds movement
 * (>3% implied prob shift since last result) — picks with stable lines
 * are *counted* without re-running the LLM.
 */
export type DayBucket = "wed" | "thu" | "fri" | "sat" | "sun";

export const TICK_TARGETS: Record<DayBucket, number> = {
  wed: 50,
  thu: 75,
  fri: 100,
  sat: 200,
  sun: 75,
};

export function bucketForDate(d: Date): DayBucket | null {
  // Convert to ET (cron triggers run in UTC; ET is -5 in winter, -4 in summer)
  // For now, naive: assume server clock can be trusted within 4h granularity.
  const day = d.getUTCDay();
  // 0=Sun, 1=Mon, ... 3=Wed, 4=Thu, 5=Fri, 6=Sat
  switch (day) {
    case 3: return "wed";
    case 4: return "thu";
    case 5: return "fri";
    case 6: return "sat";
    case 0: return "sun";
    default: return null; // Mon/Tue: no sims
  }
}

/**
 * Per the strategy doc and cost plan: re-run a fight's agents only if
 * its implied probability has shifted by more than this threshold since
 * the last weekly_simulation_result for that fight. Otherwise, count the
 * appearance against the prior result without burning an LLM call.
 */
export const ODDS_MOVEMENT_THRESHOLD = 0.03; // 3 percentage points

/**
 * gpt-4o for the first 2 ticks of the week, gpt-4o-mini afterwards.
 * Aggregation logic doesn't care which model produced a result.
 */
export function modelForTick(tickIndex: number): "gpt-4o" | "gpt-4o-mini" {
  return tickIndex < 2 ? "gpt-4o" : "gpt-4o-mini";
}
