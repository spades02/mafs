import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, isNotNull, sql } from "drizzle-orm";
import { db, user, events, recurringEdges } from "@/db";
import { sendEmail } from "@/app/lib/email";
import { signFreePickToken } from "@/lib/retention/token";
import {
  weeklyCardTeaser,
  limitHitNudge,
  inactive7d,
  RetentionPick,
} from "@/lib/retention/templates";

export const runtime = "nodejs";
export const maxDuration = 300;

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_AGO = () => new Date(Date.now() - ONE_WEEK_MS);

/**
 * Weekly retention cron. Runs Wed 6pm ET (after the first weekly_runs
 * tick has populated recurring_edges). Picks the single strongest edge
 * for the upcoming event, then emails free users one of three templates
 * by priority:
 *   1. limit-hit-nudge   (analysisCount >= 3 AND last_sim_at within 7d)
 *   2. inactive-7d       (last_login_at > 7d ago)
 *   3. weekly-card-teaser (default for everyone else who is free)
 *
 * Frequency cap: max 1 retention email per user per 7d, enforced via
 * last_retention_email_at.
 *
 * Auth: Vercel Cron header check.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Find next upcoming event.
  const [evt] = await db
    .select()
    .from(events)
    .where(gt(events.dateTime, now))
    .orderBy(events.dateTime)
    .limit(1);

  if (!evt) {
    return NextResponse.json({ skipped: true, reason: "no upcoming events" });
  }

  // 2. Pick the strongest recurring edge for the event. Strongest =
  // highest (appearance_pct × avgEdge clamped) — i.e. high frequency
  // *and* high average edge. Ties broken by appearance_pct.
  const top = await db
    .select()
    .from(recurringEdges)
    .where(
      and(
        eq(recurringEdges.eventId, evt.eventId),
        sql`${recurringEdges.appearancePct} >= 0.7`,
        sql`${recurringEdges.avgEdge} >= 2`,
      ),
    )
    .orderBy(sql`(${recurringEdges.appearancePct} * GREATEST(${recurringEdges.avgEdge}, 0)) desc`)
    .limit(1);

  if (!top[0]) {
    return NextResponse.json({ skipped: true, reason: "no qualifying recurring edge yet" });
  }
  const edge = top[0];
  const pick: RetentionPick = {
    label: edge.label,
    betType: edge.betType,
    appearancePct: edge.appearancePct,
    avgEdge: edge.avgEdge,
    latestMarketOdd: edge.latestMarketOdd,
  };

  // 3. Pull eligible free users — never sent within last 7d, has email,
  // emailAlerts on, isPro=false. Cap the batch so a single tick never
  // tries to email everyone if the table is huge.
  const cutoff = SEVEN_DAYS_AGO();
  const candidates = await db
    .select()
    .from(user)
    .where(
      and(
        eq(user.isPro, false),
        eq(user.emailAlerts, true),
        isNotNull(user.email),
        sql`(${user.lastRetentionEmailAt} IS NULL OR ${user.lastRetentionEmailAt} < ${cutoff})`,
      ),
    )
    .limit(500);

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "https://mafs.ai";
  const sevenDaysAgo = cutoff.getTime();

  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const u of candidates) {
    try {
      // Pick template by priority.
      const hitLimit = u.analysisCount >= 3 && u.lastSimAt && u.lastSimAt.getTime() > sevenDaysAgo;
      const inactive = !u.lastLoginAt || u.lastLoginAt.getTime() < sevenDaysAgo;

      const token = signFreePickToken({
        uid: u.id,
        eid: evt.eventId,
        fid: edge.fightId,
        bt: edge.betType,
        lbl: edge.label,
      });
      const freePickUrl = `${appBaseUrl.replace(/\/$/, "")}/free-pick/${token}`;
      const upgradeUrl = `${appBaseUrl.replace(/\/$/, "")}/billing`;

      const tplInput = {
        recipientName: u.name,
        pick,
        freePickUrl,
        upgradeUrl,
        appBaseUrl,
      };

      const { subject, html } = hitLimit
        ? limitHitNudge(tplInput)
        : inactive
          ? inactive7d(tplInput)
          : weeklyCardTeaser(tplInput);

      await sendEmail({ to: u.email, subject, html });
      await db.update(user).set({ lastRetentionEmailAt: new Date() }).where(eq(user.id, u.id));
      sent += 1;
    } catch (err) {
      skipped += 1;
      failures.push(`${u.email}: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`[retention] failed for ${u.email}:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    eventId: evt.eventId,
    pick: { label: edge.label, appearancePct: edge.appearancePct, avgEdge: edge.avgEdge },
    candidates: candidates.length,
    sent,
    skipped,
    failures: failures.slice(0, 5), // truncate so the response stays small
  });
}
