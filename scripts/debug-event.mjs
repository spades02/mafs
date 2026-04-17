import postgres from "postgres";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/DATABASE_URL=['"]?([^'"\n]+)/)[1];
const sql = postgres(url, { prepare: false });

const missingIds = [
  "14775744782936114105",
  "16602412518571947944",
  "1916180414644719534",
];

console.log("Lookup missing fighter IDs:");
for (const id of missingIds) {
  const r = await sql`SELECT * FROM fighters WHERE id = ${id}`;
  console.log(id, "=>", r);
}

console.log("\nDuplicate fight check (John Castaneda vs Mark Vologdin):");
const dup = await sql`
  SELECT id, fighter_a_id, fighter_b_id, event_id
  FROM fights
  WHERE id IN ('12124432805116033866', '6138262097055584341')
`;
console.log(dup);

await sql.end();
