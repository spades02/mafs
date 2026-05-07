import { eq, and } from "drizzle-orm";
import { db, user, referrals } from "@/db";
import { stripe } from "@/lib/stripe";

/**
 * Mark a referral as `paid` once the referee completes their first
 * checkout. Idempotent — safe to call from multiple webhook events.
 */
export async function markReferralPaid(refereeUserId: string): Promise<void> {
  const [ref] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.refereeUserId, refereeUserId))
    .limit(1);

  if (!ref) return;
  if (ref.status !== "pending") return; // already paid / rewarded / fraudulent

  await db
    .update(referrals)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(referrals.id, ref.id));

  console.log(`[referrals] ${ref.id} marked paid (referee=${refereeUserId})`);
}

/**
 * Reward the referrer when the referee pays their second invoice (gates
 * against fraud cancellations after the discounted month). Extends the
 * referrer's existing Stripe subscription by 1 month via Subscription
 * update API (`trial_end` set to current_period_end + 1 month).
 *
 * Only triggers when:
 *   - referral status === 'paid'
 *   - referee billing_reason === 'subscription_cycle' (not 'subscription_create')
 *   - referrer has an active Stripe subscription
 *
 * Returns true if a reward was issued.
 */
export async function maybeRewardReferralOnInvoice(
  refereeUserId: string,
  billingReason: string | null,
): Promise<boolean> {
  if (billingReason !== "subscription_cycle") return false;

  const [ref] = await db
    .select()
    .from(referrals)
    .where(and(eq(referrals.refereeUserId, refereeUserId), eq(referrals.status, "paid")))
    .limit(1);

  if (!ref) return false;

  const [referrer] = await db.select().from(user).where(eq(user.id, ref.referrerUserId)).limit(1);
  if (!referrer?.stripeSubscriptionId) {
    console.warn(`[referrals] referrer ${ref.referrerUserId} has no stripe subscription — cannot reward`);
    return false;
  }

  try {
    // Fetch current sub to read its period end
    const sub = await stripe.subscriptions.retrieve(referrer.stripeSubscriptionId);
    if (sub.status !== "active" && sub.status !== "trialing") {
      console.warn(`[referrals] referrer subscription ${sub.id} not active (${sub.status}) — skipping reward`);
      return false;
    }

    // Push current_period_end forward by 30 days via trial_end.
    // Stripe expects trial_end as a Unix timestamp (seconds). The Subscription
    // shape carries current_period_end on its first item; the top-level field
    // exists at runtime but isn't typed reliably across SDK versions, so we
    // read it loosely and fall back to "now" if missing.
    const subAny = sub as unknown as { current_period_end?: number };
    const currentEnd = typeof subAny.current_period_end === "number"
      ? subAny.current_period_end
      : Math.floor(Date.now() / 1000);
    const newTrialEnd = currentEnd + 30 * 24 * 60 * 60;

    await stripe.subscriptions.update(referrer.stripeSubscriptionId, {
      trial_end: newTrialEnd,
      proration_behavior: "none",
    });

    await db
      .update(referrals)
      .set({ status: "rewarded", rewardedAt: new Date() })
      .where(eq(referrals.id, ref.id));

    console.log(`[referrals] rewarded referrer ${referrer.id} +30d (ref ${ref.id})`);
    return true;
  } catch (err) {
    console.error("[referrals] failed to extend referrer subscription:", err);
    return false;
  }
}

