# Decision: Referrals on iOS — Web-Only in v1

**Status:** decided · **Date:** 2026-05-04 · **Scope:** Phase 5 referral system

## Question
Should the MAFS referral program (50% off first month for referee, 1 free month for referrer) work for users who subscribe via the iOS app (RevenueCat → Apple IAP), or only via web (Stripe)?

## Findings
1. **Apple Offer Codes** are App-Store-Connect-managed promo codes. They can be issued programmatically via App Store Connect API or RevenueCat's `OfferCodeRedemption` URLs, but the user must redeem in the App Store, not at our checkout — they exit our app, redeem on Apple's UI, then come back. Friction is meaningfully higher than Stripe's `prefilled_promo_code` query param.
2. **RevenueCat Win-Back Offers** target lapsed users — wrong tool for new-user referrals.
3. **Attribution**: RevenueCat's webhook (`INITIAL_PURCHASE`) doesn't carry a referral code by default. We'd need to attach it to `customer info attributes` before purchase and read it server-side in the webhook. Workable but adds another layer of state.
4. **Referrer reward**: extending an iOS subscription mid-cycle is not directly possible — Apple controls billing. Best workaround is granting a `mafs_promo_credit` flag in our DB that triggers a free month *next* renewal (we issue an Offer Code that auto-applies). More moving parts than Stripe's `Subscription.update` with proration credit.
5. **Cross-platform fairness**: a user who signs up via iOS but later switches to web (or vice-versa) shouldn't be locked out. Single-source-of-truth `referrals` table works regardless of platform; the *reward delivery* is what differs.

## Decision
**Ship web-only in v1.** iOS users land on the referral page but see a clear "Web checkout required for the discount — tap to open mafs.ai/refer/[code]" CTA.

### Rationale
- Web path covers the bulk of paid signups today (Stripe is the primary plan path on this codebase).
- Apple's flow adds 1-2 weeks of build time + ongoing operational complexity for what may be a small share of referee conversions.
- The `referrals` table schema is platform-agnostic (`platform` column = `stripe` | `revenuecat`), so iOS support drops in later without rework.

### v2 path (later)
1. Issue Apple Offer Codes via App Store Connect API when a user clicks a referral link inside the iOS app.
2. Attach `referred_by_code` to RevenueCat customer attributes pre-purchase.
3. Deliver referrer reward via a free-month Offer Code on next iOS renewal.

## Implications for Phase 5b code
- `referrals.platform` column: keep, default `'stripe'`.
- RevenueCat webhook: NOT modified in v1.
- Stripe webhook: full attribution + reward flow.
- UI: detect Capacitor / iOS UA, swap CTA copy on referral page accordingly.
