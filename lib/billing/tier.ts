import Stripe from "stripe";

export type SubscriptionTier = "free" | "pro" | "elite";

/**
 * Resolve the subscription tier from a Stripe Subscription based on which
 * STRIPE_PRO_PRICE_ID / STRIPE_ELITE_PRICE_ID matches a line item.
 * Falls back to "pro" when only `isPro` info is available (legacy webhooks
 * before Elite was introduced).
 */
export function tierFromSubscription(sub: Stripe.Subscription | null | undefined): SubscriptionTier {
  if (!sub) return "free";
  const proId = process.env.STRIPE_PRO_PRICE_ID;
  const eliteId = process.env.STRIPE_ELITE_PRICE_ID;
  for (const item of sub.items?.data ?? []) {
    const priceId = item.price?.id;
    if (eliteId && priceId === eliteId) return "elite";
    if (proId && priceId === proId) return "pro";
  }
  return "pro";
}

export function tierFromCheckoutSession(session: Stripe.Checkout.Session): SubscriptionTier {
  const proId = process.env.STRIPE_PRO_PRICE_ID;
  const eliteId = process.env.STRIPE_ELITE_PRICE_ID;
  for (const item of session.line_items?.data ?? []) {
    const priceId = item.price?.id;
    if (eliteId && priceId === eliteId) return "elite";
    if (proId && priceId === proId) return "pro";
  }
  return "pro";
}
