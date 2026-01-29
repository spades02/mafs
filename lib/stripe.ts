import "server-only";

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: process.env.STRIPE_API_VERSION as any,
  appInfo: {
    name: "MAFS",
    url: process.env.STRIPE_URL as string,
  },
});