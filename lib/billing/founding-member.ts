import { db, user } from "@/db";
import { eq, sql } from "drizzle-orm";

const FOUNDING_CAP = 100;

/**
 * Grants founding-member status to a user if the cap hasn't been reached.
 * Idempotent — safe to call repeatedly. Returns whether the flag was set.
 *
 * Note: a small race window exists between count read and write, so we may
 * grant up to ~1-2 over the cap under heavy concurrent signups. That's fine
 * for marketing display. The actual price-lock is enforced via Stripe coupon
 * application, not this flag.
 */
export async function grantFoundingMemberIfEligible(userId: string): Promise<boolean> {
  const [existing] = await db
    .select({ foundingMember: user.foundingMember })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!existing) return false;
  if (existing.foundingMember) return false;

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(eq(user.foundingMember, true));

  const current = row?.count ?? 0;
  if (current >= FOUNDING_CAP) return false;

  await db
    .update(user)
    .set({ foundingMember: true })
    .where(eq(user.id, userId));

  return true;
}
