"use server"

import { db } from "@/db"
import { savedPlay, fights, fighters, fightSettlements, events } from "@/db/schema"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { and, desc, eq, isNull, inArray } from "drizzle-orm"
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

// ---- Grading ---------------------------------------------------------------
// A saved play is "graded" once we know whether it won, lost, or pushed.
// We grade against the `fights` table (which is populated when results land),
// not `fight_settlements` — the schema is simpler and `bet.id` already
// equals `fight.id` (see analyzeFight in app/ai/agents/agents.ts).

type Outcome = "win" | "loss" | "push" | null

type MethodKind = "decision" | "ko" | "sub" | "dq" | "draw" | "unknown"

function classifyMethod(method: string | null): MethodKind {
  const m = (method || "").toLowerCase()
  if (!m) return "unknown"
  if (m.includes("draw")) return "draw"
  if (m.includes("dq") || m.includes("disqual")) return "dq"
  if (m.includes("sub")) return "sub"
  if (m.includes("ko") || m.includes("tko") || m.includes("stoppage") || m.includes("retire")) return "ko"
  if (m.includes("decision")) return "decision"
  return "unknown"
}

function gradeMethod(method: string | null): "decision" | "finish" | "unknown" {
  const k = classifyMethod(method)
  if (k === "decision") return "decision"
  if (k === "ko" || k === "sub" || k === "dq") return "finish"
  return "unknown"
}

function gradePlay(
  play: typeof savedPlay.$inferSelect,
  fight: typeof fights.$inferSelect,
  fighterA: typeof fighters.$inferSelect | null,
  fighterB: typeof fighters.$inferSelect | null,
  settlement: typeof fightSettlements.$inferSelect | null,
): Outcome {
  // Merge settlement data on top of the fights row — settlement is the
  // richer source (always has method/round/wentDistance) but fights.winnerId
  // is sometimes the only signal we have.
  const winnerId = fight.winnerId ?? settlement?.winnerId ?? null
  const method = fight.method ?? settlement?.method ?? null
  const round = fight.round ?? settlement?.round ?? null
  const wentDistance = settlement?.wentDistance ?? null

  if (!winnerId && !method && wentDistance == null) return null // not yet settled
  const bt = (play.betType || "").toUpperCase()
  const finishKind = gradeMethod(method)

  // Distance / finish bets — prefer wentDistance flag from settlements when
  // present; otherwise fall back to deriving from the method string.
  if (bt === "GTD") {
    if (wentDistance === true) return "win"
    if (wentDistance === false) return "loss"
    if (finishKind === "decision") return "win"
    if (finishKind === "finish") return "loss"
    return null
  }
  if (bt === "DGTD" || bt === "ITD") {
    if (wentDistance === true) return "loss"
    if (wentDistance === false) return "win"
    if (finishKind === "finish") return "win"
    if (finishKind === "decision") return "loss"
    return null
  }

  // Round totals — needs the round it ended in.
  if (bt === "OVER" || bt === "UNDER") {
    const m = play.label?.match(/(\d+(?:\.\d+)?)/)
    const threshold = m ? parseFloat(m[1]) : NaN
    if (!Number.isFinite(threshold) || round == null) return null
    if (bt === "OVER") return round > threshold ? "win" : "loss"
    return round <= threshold ? "win" : "loss"
  }

  // Resolve which fighter (if any) the label refers to — shared by ML, Round,
  // and Double Chance grading.
  const label = (play.label || "").toLowerCase()
  const matchesFighter = (f: typeof fighters.$inferSelect | null) => {
    if (!f) return false
    const first = (f.firstName || "").toLowerCase()
    const last = (f.lastName || "").toLowerCase()
    const nick = (f.nickname || "").toLowerCase()
    return (
      (last && label.includes(last)) ||
      (first && label.includes(first)) ||
      (nick && label.includes(nick))
    )
  }
  const aMatch = matchesFighter(fighterA)
  const bMatch = matchesFighter(fighterB)
  const pickedFighterId =
    aMatch === bMatch ? null : aMatch ? fight.fighterAId : fight.fighterBId

  // Moneyline — picked fighter must be the winner.
  if (bt === "ML") {
    if (!winnerId) return null
    if (!pickedFighterId) return null
    return pickedFighterId === winnerId ? "win" : "loss"
  }

  // Round bets (e.g. "McVey R1") — picked fighter must finish in that round.
  if (bt === "ROUND") {
    if (!winnerId || round == null) return null
    if (!pickedFighterId) return null
    const rMatch = label.match(/\br(\d+)\b/) || label.match(/round\s*(\d+)/)
    const targetRound = rMatch ? parseInt(rMatch[1], 10) : NaN
    if (!Number.isFinite(targetRound)) return null
    if (pickedFighterId !== winnerId) return "loss"
    const kind = classifyMethod(method)
    if (kind === "decision" || kind === "draw") return "loss"
    return round === targetRound ? "win" : "loss"
  }

  // Double Chance (e.g. "Buchecha by Sub or Decision") — picked fighter must
  // win, and the method must be one of the two named in the label.
  if (bt === "DOUBLE CHANCE" || bt === "DCH") {
    if (!winnerId || !method) return null
    if (!pickedFighterId) return null
    if (pickedFighterId !== winnerId) return "loss"
    const wanted = new Set<MethodKind>()
    if (/\bsub/.test(label)) wanted.add("sub")
    if (/\bko\b|\btko\b|\bknockout\b/.test(label)) wanted.add("ko")
    if (/\bdec/.test(label)) wanted.add("decision")
    if (wanted.size === 0) return null
    return wanted.has(classifyMethod(method)) ? "win" : "loss"
  }

  // MOV / Spread / Prop — too varied to grade reliably without more structured
  // fields. Leave ungraded so the badge shows Pending.
  return null
}

export async function gradeUserSavedPlays(userId: string): Promise<number> {
  const ungraded = await db
    .select()
    .from(savedPlay)
    .where(and(eq(savedPlay.userId, userId), isNull(savedPlay.outcome)))
  if (ungraded.length === 0) return 0

  const fightIds = Array.from(new Set(ungraded.map((p) => p.betId).filter(Boolean)))
  if (fightIds.length === 0) return 0

  const fightRows = await db.select().from(fights).where(inArray(fights.id, fightIds))
  if (fightRows.length === 0) return 0
  const fightById = new Map(fightRows.map((f) => [f.id, f]))

  // Event dates — used to refuse grading fights whose event hasn't happened
  // yet. Some upstream syncs write `winner_id` for future fights (e.g. UFC 328
  // had Joshua Van marked as winner before the May 8 fight), and we don't want
  // the grader to trust that.
  const eventIds = Array.from(
    new Set(fightRows.map((f) => f.eventId).filter((x): x is string => !!x)),
  )
  const eventRows = eventIds.length
    ? await db.select().from(events).where(inArray(events.eventId, eventIds))
    : []
  const eventDateById = new Map(eventRows.map((e) => [e.eventId, e.dateTime]))
  const now = Date.now()

  const fighterIds = Array.from(
    new Set(
      fightRows.flatMap((f) => [f.fighterAId, f.fighterBId].filter((x): x is string => !!x)),
    ),
  )
  const fighterRows = fighterIds.length
    ? await db.select().from(fighters).where(inArray(fighters.id, fighterIds))
    : []
  const fighterById = new Map(fighterRows.map((fr) => [fr.id, fr]))

  // Pull fight_settlements for the same set of fights — that's where method,
  // round, and wentDistance live for fights synced via the calibration path.
  const settlementRows = await db
    .select()
    .from(fightSettlements)
    .where(inArray(fightSettlements.fightId, fightIds))
  const settlementByFightId = new Map(settlementRows.map((s) => [s.fightId, s]))

  let updated = 0
  for (const play of ungraded) {
    const fight = fightById.get(play.betId)
    if (!fight) {
      console.log(`[grade] skip ${play.label} (${play.betType}) — no fights row for betId=${play.betId}`)
      continue
    }
    const settlement = settlementByFightId.get(play.betId) ?? null
    if (!fight.winnerId && !fight.method && !settlement?.winnerId && !settlement?.method && settlement?.wentDistance == null) {
      console.log(`[grade] skip ${play.label} — fight ${play.betId} has no winner/method yet (no settlement either)`)
      continue
    }
    // Event-date guard: if we know the event hasn't happened yet, refuse to
    // grade. A settlement row is treated as authoritative (it only exists
    // after the fight is over) so it overrides the date check.
    const eventDate = fight.eventId ? eventDateById.get(fight.eventId) ?? null : null
    if (!settlement && eventDate && eventDate.getTime() > now) {
      console.log(`[grade] skip ${play.label} — event ${fight.eventId} is in the future (${eventDate.toISOString()})`)
      continue
    }
    const fa = fight.fighterAId ? fighterById.get(fight.fighterAId) ?? null : null
    const fb = fight.fighterBId ? fighterById.get(fight.fighterBId) ?? null : null
    const outcome = gradePlay(play, fight, fa, fb, settlement)
    if (!outcome) {
      console.log(`[grade] skip ${play.label} (${play.betType}) — gradePlay null. fights{method=${fight.method},round=${fight.round}} settlement{method=${settlement?.method},round=${settlement?.round},wentDistance=${settlement?.wentDistance}}`)
      continue
    }
    await db
      .update(savedPlay)
      .set({ outcome, gradedAt: new Date() })
      .where(eq(savedPlay.id, play.id))
    console.log(`[grade] ✓ ${play.label} (${play.betType}) → ${outcome}`)
    updated++
  }
  if (updated > 0) {
    after(() => revalidatePath("/saved"))
  }
  return updated
}

export async function getSavedPlays() {
  const userId = await requireUserId()
  if (!userId) return []

  // Lazy grading on page load — keeps the UI honest without needing a cron.
  // Fire-and-forget if it errors so a transient DB hiccup doesn't blank the page.
  try {
    await gradeUserSavedPlays(userId)
  } catch (err) {
    console.error("gradeUserSavedPlays failed", err)
  }

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
