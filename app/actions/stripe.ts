"use server";

import type { Stripe } from "stripe";

import { headers } from "next/headers";
import { auth } from "@/app/lib/auth/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { user as userSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

const CURRENCY = "usd"
export async function createCheckoutSession(
  data: FormData,
): Promise<{ client_secret: string | null; url: string | null }> {
  const ui_mode = data.get(
    "uiMode",
  ) as Stripe.Checkout.SessionCreateParams.UiMode;
  const nextHeaders = await headers();

  const origin: string = nextHeaders.get("origin") as string;

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: "Custom amount donation",
            },
            unit_amount: 5,
          },
        },
      ],
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/donate-with-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/donate-with-checkout`,
      }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/donate-with-embedded-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  };
}

export async function createPaymentIntent(
  data: FormData,
): Promise<{ client_secret: string }> {
  const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.create({
      amount: 5,
      automatic_payment_methods: { enabled: true },
      currency: CURRENCY,
    });

  return { client_secret: paymentIntent.client_secret as string };
}

export async function createCustomerPortalSession(): Promise<{ url: string | null; error?: string }> {
  const nextHeaders = await headers();
  const session = await auth.api.getSession({
    headers: nextHeaders
  });

  if (!session?.user) {
    return { url: null, error: "unauthorized" };
  }

  // Lazily create + persist a Stripe customer if the user doesn't have one yet.
  // Without this, users whose customer record was never linked silently fail
  // every time they click "Open Customer Portal" / "Update Payment Details".
  let stripeCustomerId = session.user.stripeCustomerId;
  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name ?? undefined,
        metadata: { userId: session.user.id },
      });
      stripeCustomerId = customer.id;
      await db
        .update(userSchema)
        .set({ stripeCustomerId })
        .where(eq(userSchema.id, session.user.id));
    } catch (err) {
      console.error("[stripe] failed to create customer for user", session.user.id, err);
      return { url: null, error: "stripe_customer_create_failed" };
    }
  }

  const origin = (nextHeaders.get("origin") as string) ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/billing`,
    });
    return { url: portalSession.url };
  } catch (err) {
    console.error("[stripe] failed to create portal session", err);
    return { url: null, error: "portal_session_failed" };
  }
}