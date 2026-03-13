import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";

export async function POST(req: Request) {
  // 🛡️ Defense-in-depth: Block Stripe requests from iOS native app
  const platform = req.headers.get("x-platform");
  const userAgent = req.headers.get("user-agent") || "";
  if (platform === "ios" || /MAFS.*Capacitor.*iOS/i.test(userAgent)) {
    return NextResponse.json(
      { error: "Payment operations are not available on this platform" },
      { status: 403 }
    );
  }

  const session = await auth.api.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: fetch or create Stripe customer linked to this user
  const customerId = "...";

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });

  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
  });
}
