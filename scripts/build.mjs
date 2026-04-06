// Cross-target build wrapper.
//
// On Vercel (VERCEL=1): builds Next.js normally with API routes + middleware.
// Everywhere else (Appflow / local iOS): Capacitor loads the live site via
// `server.url` in capacitor.config.ts, so we don't need a real static export —
// we just emit a stub `out/index.html` to satisfy `webDir`.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const isVercel = process.env.VERCEL === "1";
const root = process.cwd();

if (!isVercel) {
  console.log("[build] Capacitor stub mode — Capacitor loads live site, skipping Next build");
  const outDir = path.join(root, "out");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    "<!doctype html><meta charset=utf-8><title>MAFS</title><p>Loading…</p>"
  );
  console.log("[build] Wrote stub out/index.html");
  process.exit(0);
}

// Files/dirs to hide during static export builds.
const hideTargets = [
  { from: path.join(root, "app", "api"), to: path.join(root, "app", "_api_hidden_for_static_export") },
  { from: path.join(root, "proxy.ts"), to: path.join(root, "proxy.ts.hidden_for_static_export") },
];

const moved = [];

function renameWithRetry(from, to) {
  const attempts = 10;
  for (let i = 0; i < attempts; i++) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (err) {
      if ((err.code === "EPERM" || err.code === "EBUSY" || err.code === "ENOTEMPTY") && i < attempts - 1) {
        // Windows: file watcher / dev server may briefly hold handles. Wait and retry.
        const until = Date.now() + 300;
        while (Date.now() < until) { /* spin */ }
        continue;
      }
      throw err;
    }
  }
}

function hide() {
  for (const t of hideTargets) {
    if (fs.existsSync(t.from)) {
      renameWithRetry(t.from, t.to);
      moved.push(t);
      console.log(`[build] Hidden for static export: ${path.relative(root, t.from)}`);
    }
  }
}

function restore() {
  for (const t of moved.reverse()) {
    if (fs.existsSync(t.to)) {
      try {
        renameWithRetry(t.to, t.from);
        console.log(`[build] Restored: ${path.relative(root, t.from)}`);
      } catch (err) {
        console.error(`[build] FAILED to restore ${path.relative(root, t.from)} — manually rename ${path.relative(root, t.to)} back. Error: ${err.message}`);
      }
    }
  }
}

// Always restore on exit, even if process is killed.
process.on("exit", restore);
process.on("SIGINT", () => { restore(); process.exit(130); });
process.on("SIGTERM", () => { restore(); process.exit(143); });

if (!isVercel) {
  console.log("[build] Static export mode (Capacitor / iOS target)");
  // Clear stale .next so leftover type validators from prior dev runs don't
  // reference the now-hidden API routes.
  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("[build] Cleared .next");
  }
  hide();
} else {
  console.log("[build] Server mode (Vercel target)");
}

try {
  execSync("next build", { stdio: "inherit" });
} catch (err) {
  restore();
  process.exit(err.status ?? 1);
}

restore();
