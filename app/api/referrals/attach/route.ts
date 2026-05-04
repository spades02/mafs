import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db, user, referrals } from "@/db";
import { auth } from "@/app/lib/auth/auth";
import { REFERRAL_COOKIE_NAME, isValidCodeFormat } from "@/lib/referrals/codes";

export const runtime = "nodejs";

/**
 * Called by the client immediately after signup completes. Reads the
 * mafs_ref cookie set by /api/referrals/[code], validates the code, writes
 * referredByCode on the user, creates a pending `referrals` row, and clears
 * the cookie.
 *
 * No-op (returns 200 ok:false) if:
 *   - user already has referredByCode set (replay-safe)
 *   - cookie is missing or malformed
 *   - cookie code doesn't resolve to a real user
 *   - user is trying to refer themselves
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieCode = req.cookies.get(REFERRAL_COOKIE_NAME)?.value;
  if (!cookieCode || !isValidCodeFormat(cookieCode)) {
    return NextResponse.json({ ok: false, reason: "no-cookie" });
  }

  const [me] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (me.referredByCode) {
    // Already attached — clear the stale cookie and return.
    const res = NextResponse.json({ ok: false, reason: "already-attached" });
    res.cookies.delete(REFERRAL_COOKIE_NAME);
    return res;
  }

  const [referrer] = await db.select().from(user).where(eq(user.referralCode, cookieCode)).limit(1);
  if (!referrer) {
    const res = NextResponse.json({ ok: false, reason: "code-not-found" });
    res.cookies.delete(REFERRAL_COOKIE_NAME);
    return res;
  }

  if (referrer.id === me.id) {
    const res = NextResponse.json({ ok: false, reason: "self-referral" });
    res.cookies.delete(REFERRAL_COOKIE_NAME);
    return res;
  }

  // Anti-fraud: same email domain is suspicious for self-referral. We
  // soft-flag rather than block — a fraud-monitor cron can review later.
  const refereeDomain = me.email.split("@")[1]?.toLowerCase() ?? "";
  const referrerDomain = referrer.email.split("@")[1]?.toLowerCase() ?? "";
  const sameDomain = refereeDomain && refereeDomain === referrerDomain;
  // Common public providers don't count as "same domain" for fraud purposes
  // since two genuinely different users can both use gmail.com.
  const PUBLIC_DOMAINS = new Set([
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me", "protonmail.com",
  ]);
  const suspicious = sameDomain && !PUBLIC_DOMAINS.has(refereeDomain);
  const initialStatus = suspicious ? "fraudulent" : "pending";

  await db.update(user).set({ referredByCode: cookieCode }).where(eq(user.id, me.id));

  await db.insert(referrals).values({
    id: nanoid(),
    referrerUserId: referrer.id,
    refereeUserId: me.id,
    code: cookieCode,
    platform: "stripe",
    status: initialStatus,
  });

  const res = NextResponse.json({ ok: true, status: initialStatus });
  res.cookies.delete(REFERRAL_COOKIE_NAME);
  return res;
}
