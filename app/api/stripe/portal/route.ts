import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

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

  const nextHeaders = await headers()
  const session = await auth.api.getSession(
    {
      headers: nextHeaders
    }
  );
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const dbUser = existingUser[0];
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found" },
      { status: 400 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
