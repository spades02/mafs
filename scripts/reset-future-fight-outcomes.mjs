import postgres from "postgres";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const dbUrl = envLocal.match(/DATABASE_URL=['"]?([^'"\n]+)/)[1];
const sql = postgres(dbUrl, { prepare: false });

// Find every saved_play whose bet_id maps to a fight whose event is still in
// the future AND has no settlement — these were graded against pre-populated
// winner_id values that shouldn't have been trusted.
const rows = await sql`
  SELECT sp.id, sp.user_id, sp.label, sp.bet_type, sp.outcome, sp.graded_at,
         f.id AS fight_id, f.event_id, f.winner_id,
         e.name AS event_name, e.date_time AS event_date,
         fs.id AS settlement_id
  FROM saved_plays sp
  JOIN fights f ON f.id = sp.bet_id
  LEFT JOIN events e ON e.event_id = f.event_id
  LEFT JOIN fight_settlements fs ON fs.fight_id = f.id
  WHERE sp.outcome IS NOT NULL
    AND fs.id IS NULL
    AND e.date_time IS NOT NULL
    AND e.date_time > NOW()
`;

console.log(`Found ${rows.length} graded saved_play(s) attached to future-dated unsettled fights:`);
for (const r of rows) {
  console.log(`  ${r.label} [${r.bet_type}] outcome=${r.outcome} event="${r.event_name}" date=${r.event_date?.toISOString?.() ?? r.event_date}`);
}

if (rows.length > 0) {
  const ids = rows.map((r) => r.id);
  const updated = await sql`
    UPDATE saved_plays
    SET outcome = NULL, graded_at = NULL
    WHERE id = ANY(${ids})
    RETURNING id, label
  `;
  console.log(`\nReset ${updated.length} row(s) back to Pending.`);
}

await sql.end();
