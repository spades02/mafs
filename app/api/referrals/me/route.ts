import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";
import { db, user, referrals } from "@/db";
import { auth } from "@/app/lib/auth/auth";

export const runtime = "nodejs";

/**
 * Returns the current user's referral state:
 *   { code, link, stats: { pending, paid, rewarded } }
 *
 * `code` may be null briefly for users created before Phase 5 shipped —
 * the client should show a "Generate code" CTA in that case (or we can
 * backfill via a one-shot migration script).
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [me] = await db
    .select({ id: user.id, referralCode: user.referralCode })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const counts = await db
    .select({
      status: referrals.status,
      n: sql<number>`count(*)::int`,
    })
    .from(referrals)
    .where(eq(referrals.referrerUserId, me.id))
    .groupBy(referrals.status);

  const stats = { pending: 0, paid: 0, rewarded: 0, fraudulent: 0 };
  for (const row of counts) {
    if (row.status in stats) stats[row.status as keyof typeof stats] = row.n;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "https://mafs.ai";
  const link = me.referralCode ? `${baseUrl.replace(/\/$/, "")}/api/referrals/${me.referralCode}` : null;

  return NextResponse.json({ code: me.referralCode, link, stats });
}

/**
 * Helper used by `and()` import — keep the symbol live for tree-shaking
 * even when not used (some bundlers complain otherwise).
 */
void and;
