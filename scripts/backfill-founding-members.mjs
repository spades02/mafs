// One-shot: backfill `founding_member = true` for every existing Pro user.
// Safe even if run multiple times (no-op when founding_member is already true).
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

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

const res = await client.query(
  `UPDATE "user" SET founding_member = true
   WHERE is_pro = true AND founding_member = false
   RETURNING id, email`,
);

console.log(`Backfilled ${res.rowCount} users as founding members:`);
for (const row of res.rows) console.log(`  - ${row.email}`);

await client.end();
