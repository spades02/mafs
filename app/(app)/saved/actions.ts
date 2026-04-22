"use server"

import { db } from "@/db"
import { savedPlay } from "@/db/schema"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { nanoid } from "nanoid"

export type SavedPlayInput = {
  betId: string
  eventId?: string | null
  eventName?: string | null
  fight?: string | null
  label: string
  betType: string
  oddsAmerican?: string | null
  pSim?: number | null
  pImp?: number | null
  edgePct?: number | null
  confidencePct?: number | null
}

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id ?? null
}

export async function savePlay(input: SavedPlayInput) {
  const userId = await requireUserId()
  if (!userId) return { ok: false as const, error: "unauthorized" }

  try {
    await db
      .insert(savedPlay)
      .values({
        id: nanoid(),
        userId,
        betId: input.betId,
        eventId: input.eventId ?? null,
        eventName: input.eventName ?? null,
        fight: input.fight ?? null,
        label: input.label,
        betType: input.betType,
        oddsAmerican: input.oddsAmerican ?? null,
        pSim: input.pSim ?? null,
        pImp: input.pImp ?? null,
        edgePct: input.edgePct ?? null,
        confidencePct: input.confidencePct ?? null,
      })
      .onConflictDoNothing({ target: [savedPlay.userId, savedPlay.betId] })
    after(() => revalidatePath("/saved"))
    return { ok: true as const }
  } catch (err) {
    console.error("savePlay failed", err)
    return { ok: false as const, error: "save_failed" }
  }
}

export async function unsavePlay(betId: string) {
  const userId = await requireUserId()
  if (!userId) return { ok: false as const, error: "unauthorized" }

  try {
    await db
      .delete(savedPlay)
      .where(and(eq(savedPlay.userId, userId), eq(savedPlay.betId, betId)))
    after(() => revalidatePath("/saved"))
    return { ok: true as const }
  } catch (err) {
    console.error("unsavePlay failed", err)
    return { ok: false as const, error: "unsave_failed" }
  }
}

export async function setFavorite(betId: string, isFavorite: boolean) {
  const userId = await requireUserId()
  if (!userId) return { ok: false as const, error: "unauthorized" }

  try {
    await db
      .update(savedPlay)
      .set({ isFavorite })
      .where(and(eq(savedPlay.userId, userId), eq(savedPlay.betId, betId)))
    after(() => revalidatePath("/saved"))
    return { ok: true as const, isFavorite }
  } catch (err) {
    console.error("setFavorite failed", err)
    return { ok: false as const, error: "favorite_failed" }
  }
}

export async function getSavedPlays() {
  const userId = await requireUserId()
  if (!userId) return []

  return db
    .select()
    .from(savedPlay)
    .where(eq(savedPlay.userId, userId))
    .orderBy(desc(savedPlay.savedAt))
}

export async function getSavedBetIds(): Promise<string[]> {
  const userId = await requireUserId()
  if (!userId) return []

  const rows = await db
    .select({ betId: savedPlay.betId })
    .from(savedPlay)
    .where(eq(savedPlay.userId, userId))
  return rows.map((r) => r.betId)
}
