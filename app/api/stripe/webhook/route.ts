import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/db/db";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { grantFoundingMemberIfEligible } from "@/lib/billing/founding-member";
import { markReferralPaid, maybeRewardReferralOnInvoice } from "@/lib/referrals/stripe";

// REQUIRED: Stripe webhooks must run in Node
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Invalid webhook signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("✅ Stripe webhook received:", event.type);

  try {
    switch (event.type) {
      /**
       * 1️⃣ Checkout completed
       * ONLY store Stripe IDs here
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        let userId = session.metadata?.userId || session.client_reference_id;

        // 📧 EMAIL FALLBACK: If no userId, try to find user by email
        if (!userId) {
          console.warn("⚠️ No user ID found in session. Attempting email fallback...");
          const customerEmail = session.customer_details?.email || session.customer_email;

          if (customerEmail) {
            const userByEmail = await db
              .select()
              .from(user)
              .where(eq(user.email, customerEmail))
              .limit(1);

            if (userByEmail[0]) {
              userId = userByEmail[0].id;
              console.log(`✅ Email fallback successful! Matched user ${userId} (${customerEmail})`);
            } else {
              console.error(`❌ Email fallback failed: No user found with email ${customerEmail}`);
            }
          } else {
            console.error("❌ No email found in session for fallback.");
          }
        }

        if (!userId) {
          console.error("❌ Webhook processing skipped: Could not identify user.");
          break;
        }

        if (session.mode === "subscription" && session.payment_status === "paid") {
          await db
            .update(user)
            .set({
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: "active",
              isPro: true,
            })
            .where(eq(user.id, userId));

          const granted = await grantFoundingMemberIfEligible(userId);
          if (granted) console.log(`🌟 Founding member granted to user ${userId}`);

          await markReferralPaid(userId).catch((err) =>
            console.error("[stripe-webhook] markReferralPaid failed:", err),
          );

          console.log(`✅ User ${userId} auto-provisioned via checkout session`);
        } else {
          // Fallback just for ID linking if not paid yet or not subscription
          await db
            .update(user)
            .set({
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            })
            .where(eq(user.id, userId));

          console.log(`✅ Stripe IDs saved for user ${userId}`);
        }

        break;
      }

      /**
       * 2️⃣ Subscription created / updated
       * THIS is where isPro should be set
       */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.stripeCustomerId, customerId))
          .limit(1);

        if (!existingUser[0]) {
          console.error("❌ No user found for customer:", customerId);
          break;
        }

        await db
          .update(user)
          .set({
            subscriptionStatus: subscription.status,
            isPro: subscription.status === "active",
          })
          .where(eq(user.id, existingUser[0].id));

        if (subscription.status === "active") {
          const granted = await grantFoundingMemberIfEligible(existingUser[0].id);
          if (granted) console.log(`🌟 Founding member granted to user ${existingUser[0].id}`);
        }

        console.log(
          `✅ Subscription synced for user ${existingUser[0].id} (${subscription.status})`
        );
        break;
      }

      /**
       * 3a️⃣ Invoice paid — referral reward gate (cycle 2+ only).
       * Per the referral spec, the referrer is rewarded when the referee
       * pays their SECOND invoice (billing_reason = subscription_cycle),
       * not the first (subscription_create). This prevents fraud where
       * a referee signs up with the discount, then cancels, leaving the
       * referrer with an unearned free month.
       */
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const billingReason = (invoice.billing_reason as string | null) ?? null;

        if (!customerId) break;

        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.stripeCustomerId, customerId))
          .limit(1);

        if (!existingUser[0]) break;

        await maybeRewardReferralOnInvoice(existingUser[0].id, billingReason).catch((err) =>
          console.error("[stripe-webhook] maybeRewardReferralOnInvoice failed:", err),
        );
        break;
      }

      /**
       * 3️⃣ Subscription canceled
       */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.stripeCustomerId, customerId))
          .limit(1);

        if (!existingUser[0]) {
          console.error("❌ No user found for canceled subscription:", customerId);
          break;
        }

        await db
          .update(user)
          .set({
            isPro: false,
            subscriptionStatus: "canceled",
          })
          .where(eq(user.id, existingUser[0].id));

        console.log(`✅ User ${existingUser[0].id} downgraded`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
