import postgres from "postgres";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const dbUrl = envLocal.match(/DATABASE_URL=['"]?([^'"\n]+)/)[1];
const sql = postgres(dbUrl, { prepare: false });

const namesToFind = [
  ["Tatsuro", "Taira"],
  ["Joshua", "Van"],
  ["Mayra", "Bueno"],
  ["Michelle", "Montague"],
  ["Jackson", "McVey"],
  ["Sedriques", "Dumas"],
  ["Marcus", "Buchecha"],
  ["Ryan", "Spann"],
];

console.log("=== Looking up fighters ===");
const fighterIds = new Map();
for (const [first, last] of namesToFind) {
  const rows = await sql`
    SELECT id, first_name, last_name, nickname
    FROM fighters
    WHERE LOWER(last_name) = LOWER(${last})
       OR LOWER(first_name) = LOWER(${first})
       OR (LOWER(first_name) = LOWER(${first}) AND LOWER(last_name) = LOWER(${last}))
    LIMIT 5
  `;
  console.log(`\n${first} ${last}:`);
  for (const r of rows) {
    console.log(`  ${r.id}  ${r.first_name} ${r.last_name}${r.nickname ? ` (${r.nickname})` : ""}`);
    fighterIds.set(`${r.first_name} ${r.last_name}`.toLowerCase(), r.id);
  }
}

console.log("\n=== Looking up fights involving these fighters ===");
const allIds = [...fighterIds.values()];
if (allIds.length > 0) {
  const fightRows = await sql`
    SELECT f.id, f.event_id, f.fighter_a_id, f.fighter_b_id, f.winner_id, f.method, f.round,
           e.name AS event_name, e.date_time
    FROM fights f
    LEFT JOIN events e ON e.event_id = f.event_id
    WHERE f.fighter_a_id = ANY(${allIds}) OR f.fighter_b_id = ANY(${allIds})
    ORDER BY e.date_time DESC NULLS LAST
    LIMIT 30
  `;
  for (const f of fightRows) {
    const fa = await sql`SELECT first_name, last_name FROM fighters WHERE id = ${f.fighter_a_id}`;
    const fb = await sql`SELECT first_name, last_name FROM fighters WHERE id = ${f.fighter_b_id}`;
    const fan = fa[0] ? `${fa[0].first_name} ${fa[0].last_name}` : f.fighter_a_id;
    const fbn = fb[0] ? `${fb[0].first_name} ${fb[0].last_name}` : f.fighter_b_id;
    const winner = f.winner_id
      ? f.winner_id === f.fighter_a_id ? fan : f.winner_id === f.fighter_b_id ? fbn : f.winner_id
      : "—";
    console.log(`\nfight.id = ${f.id}`);
    console.log(`  ${fan}  vs  ${fbn}`);
    console.log(`  event = ${f.event_name ?? "?"}  (${f.date_time?.toISOString?.() ?? f.date_time ?? "no date"})`);
    console.log(`  winner = ${winner}  method = ${f.method ?? "—"}  round = ${f.round ?? "—"}`);

    const settle = await sql`SELECT method, round, went_distance, winner_id, settled_at FROM fight_settlements WHERE fight_id = ${f.id}`;
    if (settle.length > 0) {
      const s = settle[0];
      const sw = s.winner_id === f.fighter_a_id ? fan : s.winner_id === f.fighter_b_id ? fbn : (s.winner_id ?? "—");
      console.log(`  settlement: winner=${sw}  method=${s.method ?? "—"}  round=${s.round ?? "—"}  wentDistance=${s.went_distance}  settledAt=${s.settled_at?.toISOString?.() ?? s.settled_at}`);
    } else {
      console.log(`  settlement: (none)`);
    }

    const saved = await sql`SELECT user_id, label, bet_type, outcome, graded_at, saved_at FROM saved_plays WHERE bet_id = ${f.id}`;
    for (const s of saved) {
      console.log(`  saved_play: "${s.label}"  type=${s.bet_type}  outcome=${s.outcome ?? "null"}  graded=${s.graded_at?.toISOString?.() ?? "—"}  saved=${s.saved_at?.toISOString?.() ?? s.saved_at}`);
    }
  }
}

await sql.end();
