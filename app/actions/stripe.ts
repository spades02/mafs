"use server";

import type { Stripe } from "stripe";

import { headers } from "next/headers";
import { auth } from "@/app/lib/auth/auth";
import { stripe } from "@/lib/stripe";

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

  if (!session?.user?.stripeCustomerId) {
    return { url: null, error: "No Stripe customer ID found" };
  }

  const origin = nextHeaders.get("origin") as string;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: session.user.stripeCustomerId,
    return_url: `${origin}/billing`,
  });

  return { url: portalSession.url };
}