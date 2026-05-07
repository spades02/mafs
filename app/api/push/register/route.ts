import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { db, deviceTokens } from "@/db";
import { auth } from "@/app/lib/auth/auth";

export const runtime = "nodejs";

/**
 * Called by the iOS client after `PushNotifications.register()` returns a
 * device token. Idempotent — safe to call repeatedly. We dedupe on
 * (user_id, token) via the unique index.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token?: string; platform?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  const platform = String(body.platform ?? "apns").toLowerCase();

  if (!token || token.length < 32) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  if (platform !== "apns" && platform !== "fcm") {
    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  }

  // Upsert: if (userId, token) already exists, just bump updated_at.
  const [existing] = await db
    .select()
    .from(deviceTokens)
    .where(and(eq(deviceTokens.userId, session.user.id), eq(deviceTokens.token, token)))
    .limit(1);

  if (existing) {
    await db
      .update(deviceTokens)
      .set({ updatedAt: new Date() })
      .where(eq(deviceTokens.id, existing.id));
    return NextResponse.json({ ok: true, status: "updated" });
  }

  await db.insert(deviceTokens).values({
    id: nanoid(),
    userId: session.user.id,
    platform,
    token,
  });

  return NextResponse.json({ ok: true, status: "created" });
}

/**
 * DELETE — used by the settings opt-out toggle to clear ALL device
 * tokens for the current user (any platform). The user can re-register
 * any time by hitting POST again.
 */
export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await db.delete(deviceTokens).where(eq(deviceTokens.userId, session.user.id));
  return NextResponse.json({ ok: true });
}
