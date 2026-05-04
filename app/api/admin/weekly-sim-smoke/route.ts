import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Admin-only smoke test for the weekly-sims cron. Forwards to the cron
 * route with `ignoreBucket=1` (and optionally `eventId=...`) so you can
 * run a tick at any time, on any event, regardless of day-of-week.
 *
 * Auth: must be a session belonging to a user_id listed in
 * MAFS_ADMIN_USER_IDS (comma-separated).
 *
 * Usage:
 *   GET /api/admin/weekly-sim-smoke
 *   GET /api/admin/weekly-sim-smoke?eventId=ufc_312
 *
 * Returns the cron handler's JSON output unchanged so you can see what
 * the production schedule will produce.
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminIds = (process.env.MAFS_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!adminIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden — not an admin" }, { status: 403 });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const url = new URL(req.url);
  const params = new URLSearchParams({ ignoreBucket: "1" });
  const eventId = url.searchParams.get("eventId");
  if (eventId) params.set("eventId", eventId);

  // Compose the same-origin call to the cron handler.
  const origin = `${url.protocol}//${url.host}`;
  const target = `${origin}/api/cron/weekly-simulations?${params.toString()}`;

  const cronResp = await fetch(target, {
    headers: { authorization: `Bearer ${cronSecret}` },
  });
  const body = await cronResp.json().catch(() => ({ error: "non-JSON response" }));
  return NextResponse.json(body, { status: cronResp.status });
}
