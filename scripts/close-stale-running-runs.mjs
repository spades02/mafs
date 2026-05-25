import postgres from "postgres";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const dbUrl = envLocal.match(/DATABASE_URL=['"]?([^'"\n]+)/)[1];

const sql = postgres(dbUrl, { prepare: false });

console.log("=== Stale running rows (event already passed) BEFORE ===");
const before = await sql`
  SELECT wr.id, wr.event_id, e.name AS event_name, e.date_time, wr.status,
         wr.target_sims, wr.total_fights_simulated
  FROM weekly_runs wr
  JOIN events e ON e.event_id = wr.event_id
  WHERE wr.status = 'running' AND e.date_time < NOW()
  ORDER BY e.date_time
`;
console.table(before);

if (before.length === 0) {
  console.log("Nothing to close.");
  await sql.end();
  process.exit(0);
}

const updated = await sql`
  UPDATE weekly_runs wr
  SET status = 'completed', completed_at = NOW()
  FROM events e
  WHERE e.event_id = wr.event_id
    AND wr.status = 'running'
    AND e.date_time < NOW()
  RETURNING wr.id, wr.event_id, wr.status, wr.completed_at
`;

console.log("\n=== Closed rows ===");
console.table(updated);

await sql.end();
