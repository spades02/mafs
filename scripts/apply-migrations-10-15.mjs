// One-shot: apply hand-written SQL migrations 0010-0015 to the DATABASE_URL
// in .env / .env.local. Drizzle-kit's auto-runner doesn't track these because
// they were added directly as SQL files without a journal entry.
//
// Usage: node scripts/apply-migrations-10-15.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { config as loadEnv } from "dotenv";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.local") });
loadEnv({ path: join(__dirname, "..", ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const files = [
  "0010_founding_member_weekly_pick.sql",
  "0011_weekly_sims_engine.sql",
  "0012_support_messages.sql",
  "0013_referrals.sql",
  "0014_retention_columns.sql",
  "0015_push_notifications.sql",
];

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

for (const f of files) {
  const sql = readFileSync(join(__dirname, "..", "drizzle", f), "utf8");
  process.stdout.write(`Applying ${f}... `);
  try {
    await client.query(sql);
    console.log("OK");
  } catch (err) {
    console.error(`FAILED: ${err.message}`);
    process.exit(1);
  }
}

await client.end();
console.log("All migrations applied.");
