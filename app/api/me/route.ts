import { headers } from "next/headers";
import { auth } from "@/app/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return NextResponse.json({
    user: session?.user ?? null,
  });
}
