// One-shot: canonicalize GTD/DGTD labels in weekly_simulation_results.
//
// Why: agent-generated label is free-text; the LLM emitted ~18 wording
// variants of the same conceptual bet ("Fight GTD", "Fight Goes The
// Distance", "Fight Goes to Decision", etc.). The cron write path and
// the aggregator now normalize new writes, but historical rows pre-date
// that fix. This brings them in line with normalizeLabel() from
// lib/weekly-sims/normalize-label.ts. Idempotent.
//
// Run with:
//   node scripts/backfill-normalize-labels.mjs
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

try {
  await client.query("BEGIN");

  const gtd = await client.query(
    `UPDATE weekly_simulation_results
     SET label = 'Fight Goes The Distance'
     WHERE bet_type = 'GTD' AND label <> 'Fight Goes The Distance'`,
  );
  console.log(`GTD: normalized ${gtd.rowCount} rows`);

  const dgtd = await client.query(
    `UPDATE weekly_simulation_results
     SET label = 'Fight Doesn''t Go The Distance'
     WHERE bet_type = 'DGTD' AND label <> 'Fight Doesn''t Go The Distance'`,
  );
  console.log(`DGTD: normalized ${dgtd.rowCount} rows`);

  await client.query("COMMIT");

  // Verify
  const after = await client.query(
    `SELECT bet_type, label, COUNT(*)::int AS row_count
     FROM weekly_simulation_results
     WHERE bet_type IN ('GTD', 'DGTD')
     GROUP BY bet_type, label
     ORDER BY bet_type, row_count DESC`,
  );
  console.log("\nPost-backfill distribution:");
  for (const r of after.rows) {
    console.log(`  ${r.bet_type.padEnd(5)} ${String(r.row_count).padStart(4)}  ${r.label}`);
  }
} catch (err) {
  await client.query("ROLLBACK");
  console.error("Backfill failed, rolled back:", err);
  process.exitCode = 1;
} finally {
  await client.end();
}
