// Full logical backup of the MAFS Postgres database to newline-delimited JSON.
//
// Written for the shutdown: it captures every row of every public table so the
// data survives independently of the Supabase project's plan or paused state.
// Combined with the SQL in drizzle/, this is a complete restore path.
//
// Output goes OUTSIDE the repo by default — the dump contains user emails,
// session tokens, and OAuth account rows, and must never be committed.
//
//   node scripts/backup-db.mjs [outputDir]
//
// Default outputDir: ../mafs-backup-<YYYY-MM-DD> relative to the repo.
//
// Three constraints shape the implementation:
//
//   1. The connection runs through Supabase's transaction pooler, which enforces
//      a 2 min statement_timeout. A plain `SELECT *` on analysis_runs (11 MB of
//      JSONB) exceeds that, so reads are paged.
//
//   2. Paging uses ctid keyset (`WHERE ctid > $last ORDER BY ctid`) rather than
//      LIMIT/OFFSET. OFFSET without a stable sort can repeat or skip rows, and
//      every table here is guaranteed to have a ctid whereas not all have a
//      single-column primary key. A server-side CURSOR was tried first and
//      silently dropped rows when the callback awaited a write-stream drain, so
//      it is deliberately not used.
//
//   3. Throughput to the pooler measured ~65 KB/s, so a 60 MB database takes
//      roughly 15 minutes. Each table is written to a .partial file and renamed
//      only after its row count is verified, so an interrupted run resumes and
//      a truncated table is never mistaken for a finished one.

import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const envFile = fs.existsSync(".env.local") ? ".env.local" : ".env";
const match = fs.readFileSync(envFile, "utf8").match(/DATABASE_URL=['"]?([^'"\n\r]+)/);
if (!match) {
  console.error(`[backup] No DATABASE_URL found in ${envFile}`);
  process.exit(1);
}

const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.resolve(process.argv[2] ?? path.join("..", `mafs-backup-${stamp}`));
fs.mkdirSync(outDir, { recursive: true });

const sql = postgres(match[1], { prepare: false, idle_timeout: 0, max: 1 });

const tables = await sql`
  SELECT c.relname AS name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY pg_total_relation_size(c.oid)
`;

const PAGE = 200;
const manifest = [];
const mismatches = [];

for (const { name } of tables) {
  const finalFile = path.join(outDir, `${name}.jsonl`);
  const partFile = `${finalFile}.partial`;

  // Authoritative row count, taken before the read so a table that grows
  // mid-backup surfaces as a mismatch rather than silent truncation.
  const [{ n: expected }] = await sql.unsafe(
    `SELECT count(*)::int AS n FROM "public"."${name}"`
  );

  // Resume: a renamed file means that table finished and verified previously.
  if (fs.existsSync(finalFile)) {
    const have = fs.readFileSync(finalFile, "utf8").split("\n").filter(Boolean).length;
    if (have === expected) {
      manifest.push({ table: name, rows: have, expected, file: path.basename(finalFile) });
      console.log(`[backup] ${name.padEnd(28)} ${String(have).padStart(7)} rows (already done)`);
      continue;
    }
    console.log(`[backup] ${name.padEnd(28)} re-reading (have ${have}, expect ${expected})`);
    fs.unlinkSync(finalFile);
  }

  const lines = [];
  let lastCtid = null;
  let total = 0;
  const started = Date.now();

  for (;;) {
    // Table name comes from pg_class, not user input, so interpolation is safe.
    // ctid is compared as text->tid; the cast keeps the literal parameterised.
    const where = lastCtid ? `WHERE ctid > '${lastCtid}'::tid` : "";
    const rows = await sql.unsafe(
      `SELECT ctid::text AS __ctid, * FROM "public"."${name}" ${where} ORDER BY ctid LIMIT ${PAGE}`
    );
    if (rows.length === 0) break;

    for (const row of rows) {
      const { __ctid, ...data } = row;
      lastCtid = __ctid;
      lines.push(JSON.stringify(data));
    }
    total += rows.length;
    if (rows.length < PAGE) break;
  }

  fs.writeFileSync(partFile, lines.length ? lines.join("\n") + "\n" : "", "utf8");

  const secs = ((Date.now() - started) / 1000).toFixed(1);

  if (total !== expected) {
    mismatches.push({ table: name, got: total, expected });
    console.error(
      `[backup] ${name.padEnd(28)} MISMATCH got ${total}, expected ${expected} — left as .partial`
    );
    continue;
  }

  fs.renameSync(partFile, finalFile);
  manifest.push({ table: name, rows: total, expected, file: path.basename(finalFile) });
  console.log(`[backup] ${name.padEnd(28)} ${String(total).padStart(7)} rows  (${secs}s)`);
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      takenAt: new Date().toISOString(),
      database: "mafs",
      verified: mismatches.length === 0,
      tables: manifest,
      mismatches,
    },
    null,
    2
  )
);

const grand = manifest.reduce((n, t) => n + t.rows, 0);
console.log(`\n[backup] ${manifest.length}/${tables.length} tables verified, ${grand} rows total`);
console.log(`[backup] Written to ${outDir}`);

await sql.end();

if (mismatches.length) {
  console.error(`\n[backup] FAILED — ${mismatches.length} table(s) did not verify:`);
  for (const m of mismatches) console.error(`  ${m.table}: got ${m.got}, expected ${m.expected}`);
  process.exit(1);
}
