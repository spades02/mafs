import postgres from "postgres";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const envBase = fs.readFileSync(".env", "utf8");
const envAll = envLocal + "\n" + envBase;
const apiKey = envAll.match(/SPORTS_DATA_API_KEY=['"]?([^'"\n]+)/)[1];
const dbUrl = envLocal.match(/DATABASE_URL=['"]?([^'"\n]+)/)[1];

const sql = postgres(dbUrl, { prepare: false });

// Missing fighter mapping: our DB's fighter_id → SportsData FighterId
const missingFighters = [
  { dbId: "1916180414644719534", sdId: 140005717, expectedName: "Gokhan Saricam" },   // Tanner Boser opponent
  { dbId: "16602412518571947944", sdId: 140005741, expectedName: "Jamie Siraj" },      // John Yannis opponent
  { dbId: "14775744782936114105", sdId: 140005716, expectedName: "Julien LeBlanc" },   // Robert Valentin opponent
];

console.log("=== Fetching fighter profiles from SportsData ===");
const fighterPayloads = [];
for (const m of missingFighters) {
  const res = await fetch(
    `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${m.sdId}?key=${apiKey}`
  );
  if (!res.ok) {
    console.error(`  Failed ${m.sdId}: HTTP ${res.status}`);
    continue;
  }
  const f = await res.json();
  const firstName = f.FirstName?.trim() || m.expectedName.split(" ")[0];
  const lastName = f.LastName?.trim() || m.expectedName.split(" ").slice(1).join(" ");
  const payload = {
    id: m.dbId,
    first_name: firstName,
    last_name: lastName,
    nickname: f.Nickname || null,
    stance: f.Stance || null,
    reach_in: f.Reach ?? null,
    height_in: f.Height ?? null,
    weight_class: f.WeightClass || null,
    wins: f.Wins ?? 0,
    losses: f.Losses ?? 0,
    slpm: null,
    str_acc: null,
    td_avg: null,
    sub_avg: null,
  };
  fighterPayloads.push(payload);
  console.log(`  ${firstName} ${lastName} (reach=${payload.reach_in}, height=${payload.height_in}, record=${payload.wins}-${payload.losses})`);
}

console.log("\n=== Inserting fighters ===");
for (const p of fighterPayloads) {
  await sql`
    INSERT INTO fighters (
      id, first_name, last_name, nickname, stance,
      reach_in, height_in, weight_class, wins, losses,
      slpm, str_acc, td_avg, sub_avg, created_at
    ) VALUES (
      ${p.id}, ${p.first_name}, ${p.last_name}, ${p.nickname}, ${p.stance},
      ${p.reach_in}, ${p.height_in}, ${p.weight_class}, ${p.wins}, ${p.losses},
      ${p.slpm}, ${p.str_acc}, ${p.td_avg}, ${p.sub_avg}, NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `;
  console.log(`  inserted ${p.first_name} ${p.last_name} (id=${p.id})`);
}

console.log("\n=== Removing duplicate Castaneda/Vologdin fight ===");
// Keep 12124432805116033866, delete 6138262097055584341
const del = await sql`DELETE FROM fights WHERE id = '6138262097055584341' RETURNING id`;
console.log(`  deleted rows:`, del);

console.log("\n=== Verifying fixes ===");
const check = await sql`
  SELECT
    f.id,
    fa.first_name || ' ' || fa.last_name AS fighter_a_name,
    fb.first_name || ' ' || fb.last_name AS fighter_b_name
  FROM fights f
  LEFT JOIN fighters fa ON fa.id = f.fighter_a_id
  LEFT JOIN fighters fb ON fb.id = f.fighter_b_id
  WHERE f.event_id = '14099799623177623410'
  ORDER BY f.id
`;
console.table(check);

await sql.end();
