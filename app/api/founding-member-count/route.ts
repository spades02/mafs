import { db, user } from "@/db";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const FOUNDING_CAP = 100;
const TOTAL_GOAL = 1000;

let cache: { ts: number; payload: { founding: number; foundingCap: number; totalPro: number; totalGoal: number } } | null = null;
const CACHE_TTL_MS = 60_000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(cache.payload);
  }

  const [foundingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(eq(user.foundingMember, true));

  const [proRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(eq(user.isPro, true));

  const payload = {
    founding: foundingRow?.count ?? 0,
    foundingCap: FOUNDING_CAP,
    totalPro: proRow?.count ?? 0,
    totalGoal: TOTAL_GOAL,
  };

  cache = { ts: Date.now(), payload };
  return NextResponse.json(payload);
}
