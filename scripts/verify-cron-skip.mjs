import postgres from "postgres";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const dbUrl = envLocal.match(/DATABASE_URL=['"]?([^'"\n]+)/)[1];

const sql = postgres(dbUrl, { prepare: false });

// Mirror the route's "next upcoming event" → "current running run" lookup.
const now = new Date();
const [upcoming] = await sql`
  SELECT event_id, name, date_time
  FROM events
  WHERE date_time > ${now}
  ORDER BY date_time
  LIMIT 1
`;
if (!upcoming) {
  console.log("No upcoming event — cron would skip.");
  await sql.end();
  process.exit(0);
}

const [existingRun] = await sql`
  SELECT id, status, target_sims, total_fights_simulated, tick_count
  FROM weekly_runs
  WHERE event_id = ${upcoming.event_id} AND status = 'running'
  ORDER BY started_at DESC
  LIMIT 1
`;

const fights = await sql`
  SELECT id FROM fights
  WHERE event_id = ${upcoming.event_id}
    AND fighter_a_id IS NOT NULL AND fighter_b_id IS NOT NULL
`;

const fightCount = Math.max(1, fights.length);
const runTarget = existingRun?.target_sims ?? 100;
const simsSoFar = existingRun?.total_fights_simulated ?? 0;
const remainingBudget = Math.max(0, runTarget - simsSoFar);

// TICK_TARGETS from lib/weekly-sims/schedule.ts (post-change)
const TICK_TARGETS = { wed: 10, thu: 15, fri: 20, sat: 40, sun: 15 };
const TICKS_PER_DAY = 6;
const MAX_LOOPS_PER_TICK = 5;

// Simulate every bucket so we cover Wed, Thu, Fri, Sat, Sun.
console.log(`\nUpcoming event: ${upcoming.name} (${upcoming.date_time.toISOString()})`);
console.log(`Run: target=${runTarget}, sims_so_far=${simsSoFar}, remaining_budget=${remainingBudget}, fights=${fightCount}\n`);

const rows = [];
for (const [bucket, targetThisTick] of Object.entries(TICK_TARGETS)) {
  const innerLoops = remainingBudget === 0
    ? 0
    : Math.min(
        MAX_LOOPS_PER_TICK,
        Math.max(1, Math.ceil(targetThisTick / TICKS_PER_DAY / fightCount)),
        Math.ceil(remainingBudget / fightCount),
      );
  rows.push({
    bucket,
    bucket_target: targetThisTick,
    inner_loops: innerLoops,
    llm_called: innerLoops > 0 ? "YES" : "NO (budget cap)",
  });
}
console.table(rows);

await sql.end();
