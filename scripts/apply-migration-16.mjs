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

const file = "0016_elite_tier.sql";
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

const sql = readFileSync(join(__dirname, "..", "drizzle", file), "utf8");
process.stdout.write(`Applying ${file}... `);
try {
  await client.query(sql);
  console.log("OK");
} catch (err) {
  console.error(`FAILED: ${err.message}`);
  process.exit(1);
}

await client.end();
console.log("Migration applied.");
