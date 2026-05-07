import { NextRequest, NextResponse } from "next/server";
import { db, user } from "@/db";
import { eq } from "drizzle-orm";
import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_COOKIE_MAX_AGE_SEC,
  isValidCodeFormat,
} from "@/lib/referrals/codes";

export const runtime = "nodejs";

/**
 * Public referral-link landing route. Visitors hit /api/referrals/ABC23DEF;
 * we validate the code, set a 30-day cookie, then 302 to /auth/signup.
 *
 * Invalid codes still redirect to signup (so a typo doesn't break the
 * funnel) but no cookie is set.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = String(raw ?? "").toUpperCase();

  const url = new URL(req.url);
  const signupUrl = new URL("/auth/signup", url.origin);
  signupUrl.searchParams.set("ref", code);

  const res = NextResponse.redirect(signupUrl);

  if (!isValidCodeFormat(code)) {
    return res;
  }

  // Verify the code resolves to a real user before pinning the cookie. This
  // prevents anyone from minting a junk code via the URL and getting credit.
  const [referrer] = await db.select({ id: user.id }).from(user).where(eq(user.referralCode, code)).limit(1);
  if (!referrer) {
    return res;
  }

  res.cookies.set(REFERRAL_COOKIE_NAME, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REFERRAL_COOKIE_MAX_AGE_SEC,
  });
  return res;
}
