import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db, user } from "@/db";
import { auth } from "@/app/lib/auth/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { optIn?: boolean };
  if (typeof body.optIn !== "boolean") {
    return NextResponse.json({ error: "optIn boolean required" }, { status: 400 });
  }
  await db
    .update(user)
    .set({ pushNotificationsOptIn: body.optIn })
    .where(eq(user.id, session.user.id));
  return NextResponse.json({ ok: true });
}
