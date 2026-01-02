import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db/db";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("No signature found");
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log("✅ Webhook event received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        console.log("💳 Checkout completed for user:", userId);

        if (!userId) {
          console.error("❌ No userId in session metadata");
          break;
        }

        // Update user to pro
        await db
          .update(user)
          .set({
            isPro: true,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "active",
          })
          .where(eq(user.id, userId));

        console.log(`✅ User ${userId} upgraded to Pro`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log("🔄 Subscription updated for customer:", customerId);

        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.stripeCustomerId, customerId))
          .limit(1);

        if (existingUser[0]) {
          await db
            .update(user)
            .set({
              subscriptionStatus: subscription.status,
              isPro: subscription.status === "active",
            })
            .where(eq(user.id, existingUser[0].id));

          console.log(`✅ Subscription updated for user ${existingUser[0].id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log("🗑️ Subscription canceled for customer:", customerId);

        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.stripeCustomerId, customerId))
          .limit(1);

        if (existingUser[0]) {
          await db
            .update(user)
            .set({
              isPro: false,
              subscriptionStatus: "canceled",
            })
            .where(eq(user.id, existingUser[0].id));

          console.log(`✅ Subscription canceled for user ${existingUser[0].id}`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}