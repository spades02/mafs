import postgres from "postgres";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const dbUrl = envLocal.match(/DATABASE_URL=['"]?([^'"\n]+)/)[1];

const sql = postgres(dbUrl, { prepare: false });

console.log("=== Active weekly_runs (status='running') BEFORE ===");
const before = await sql`
  SELECT id, event_id, status, target_sims, tick_count, total_fights_simulated, started_at
  FROM weekly_runs
  WHERE status = 'running'
  ORDER BY started_at DESC
`;
console.table(before);

if (before.length === 0) {
  console.log("No running rows found — nothing to update.");
  await sql.end();
  process.exit(0);
}

const updated = await sql`
  UPDATE weekly_runs
  SET target_sims = 100
  WHERE status = 'running'
  RETURNING id, event_id, target_sims, total_fights_simulated
`;

console.log("\n=== Updated rows ===");
console.table(updated);

await sql.end();
