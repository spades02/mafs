import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { grantFoundingMemberIfEligible } from "@/lib/billing/founding-member";

// REQUIRED: Webhooks must run in Node
export const runtime = "nodejs";

/**
 * RevenueCat Webhook Handler
 * 
 * Receives subscription lifecycle events from RevenueCat and updates
 * the user's Pro status in our Postgres database.
 * 
 * Events handled:
 * - INITIAL_PURCHASE → activate Pro
 * - RENEWAL → renew Pro
 * - CANCELLATION → mark as canceled (keep Pro until expiry)
 * - EXPIRATION → deactivate Pro
 * - UNCANCELLATION → reactivate subscription status
 * - BILLING_ISSUE → mark as past_due
 * 
 * Security: Bearer token verification against REVENUECAT_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
    // 🛡️ Verify webhook authorization
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (!expectedToken) {
        console.error("❌ REVENUECAT_WEBHOOK_SECRET not configured");
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 },
        );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        console.error("❌ Invalid RevenueCat webhook authorization");
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }

    try {
        const body = await req.json();
        const event = body?.event;

        if (!event) {
            return NextResponse.json(
                { error: "Missing event payload" },
                { status: 400 },
            );
        }

        const {
            type,
            app_user_id,
            original_app_user_id,
            entitlement_ids,
            expiration_at_ms,
        } = event;

        console.log(`✅ RevenueCat webhook received: ${type} for user ${app_user_id}`);

        // Resolve user ID — try app_user_id first, fall back to original_app_user_id
        const userId = app_user_id || original_app_user_id;

        if (!userId) {
            console.error("❌ No user ID in webhook payload");
            return NextResponse.json(
                { error: "Missing user ID" },
                { status: 400 },
            );
        }

        // Check if this is a "pro" entitlement
        const hasProEntitlement =
            entitlement_ids?.includes("pro") ?? false;

        // Parse expiration timestamp
        const expiresAt = expiration_at_ms
            ? new Date(expiration_at_ms)
            : null;

        switch (type) {
            /**
             * New subscription purchase
             */
            case "INITIAL_PURCHASE":
            case "NON_RENEWING_PURCHASE": {
                await db
                    .update(user)
                    .set({
                        isPro: hasProEntitlement || true,
                        subscriptionStatus: "active",
                        subscriptionPlatform: "revenuecat",
                        rcCustomerId: userId,
                        ...(expiresAt && { subscriptionExpiresAt: expiresAt }),
                    })
                    .where(eq(user.id, userId));

                const granted = await grantFoundingMemberIfEligible(userId);
                if (granted) console.log(`🌟 Founding member granted to user ${userId}`);

                console.log(`✅ User ${userId} activated via Apple IAP`);
                break;
            }

            /**
             * Subscription renewed
             */
            case "RENEWAL": {
                await db
                    .update(user)
                    .set({
                        isPro: true,
                        subscriptionStatus: "active",
                        ...(expiresAt && { subscriptionExpiresAt: expiresAt }),
                    })
                    .where(eq(user.id, userId));

                console.log(`✅ User ${userId} subscription renewed`);
                break;
            }

            /**
             * User canceled (but still has access until expiry)
             */
            case "CANCELLATION": {
                await db
                    .update(user)
                    .set({
                        subscriptionStatus: "canceled",
                        // Keep isPro: true — access continues until EXPIRATION
                    })
                    .where(eq(user.id, userId));

                console.log(`⚠️ User ${userId} subscription canceled (still active until expiry)`);
                break;
            }

            /**
             * Subscription expired — revoke access
             */
            case "EXPIRATION": {
                await db
                    .update(user)
                    .set({
                        isPro: false,
                        subscriptionStatus: "expired",
                    })
                    .where(eq(user.id, userId));

                console.log(`✅ User ${userId} subscription expired, Pro revoked`);
                break;
            }

            /**
             * User re-enabled auto-renew after cancellation
             */
            case "UNCANCELLATION": {
                await db
                    .update(user)
                    .set({
                        subscriptionStatus: "active",
                    })
                    .where(eq(user.id, userId));

                console.log(`✅ User ${userId} re-enabled auto-renew`);
                break;
            }

            /**
             * Payment failed — grace period
             */
            case "BILLING_ISSUE": {
                await db
                    .update(user)
                    .set({
                        subscriptionStatus: "past_due",
                    })
                    .where(eq(user.id, userId));

                console.log(`⚠️ User ${userId} has a billing issue`);
                break;
            }

            /**
             * Subscription extended (e.g., by Apple support)
             */
            case "SUBSCRIPTION_EXTENDED": {
                await db
                    .update(user)
                    .set({
                        isPro: true,
                        subscriptionStatus: "active",
                        ...(expiresAt && { subscriptionExpiresAt: expiresAt }),
                    })
                    .where(eq(user.id, userId));

                console.log(`✅ User ${userId} subscription extended`);
                break;
            }

            /**
             * Test event from RevenueCat dashboard
             */
            case "TEST": {
                console.log("✅ RevenueCat test webhook received successfully");
                break;
            }

            default:
                console.log(`ℹ️ Unhandled RevenueCat event: ${type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("❌ RevenueCat webhook processing failed:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 },
        );
    }
}
