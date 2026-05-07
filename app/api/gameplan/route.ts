import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, gt, and, inArray } from "drizzle-orm";
import { auth } from "@/app/lib/auth/auth";
import { db, events, recurringEdges, fights, fighters } from "@/db";
import { buildCard, RecurringEdgeRow } from "@/lib/weekly-sims/build-card";
import { RISK_MODELS, RiskModel } from "@/lib/weekly-sims/strategy";

export const runtime = "nodejs";

/**
 * Builds the Gameplan response — one card per risk model — for the next
 * upcoming UFC event, sourced from `recurring_edges`. Bankroll is optional
 * (?bankroll=1000); when omitted, dollar fields are null and the UI shows
 * units only.
 *
 * Auth: must be Pro or Elite. Free users are blocked here (Phase 3 is paid).
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Free users get a teaser shape (top straight only). Pro+ get full cards.
  const tier = (session.user as { subscriptionTier?: string }).subscriptionTier ?? "free";
  const isPro = (session.user as { isPro?: boolean }).isPro === true;

  const url = new URL(req.url);
  const bankrollParam = url.searchParams.get("bankroll");
  const bankrollUsd = bankrollParam ? parseFloat(bankrollParam) : null;
  const eventIdParam = url.searchParams.get("eventId");

  const now = new Date();
  let evt;
  if (eventIdParam) {
    const [forced] = await db
      .select()
      .from(events)
      .where(eq(events.eventId, eventIdParam))
      .limit(1);
    if (!forced) return NextResponse.json({ error: "event not found" }, { status: 404 });
    evt = forced;
  } else {
    const [next] = await db
      .select()
      .from(events)
      .where(gt(events.dateTime, now))
      .orderBy(events.dateTime)
      .limit(1);
    if (!next) return NextResponse.json({ error: "no upcoming event" }, { status: 404 });
    evt = next;
  }

  const edges = await db
    .select()
    .from(recurringEdges)
    .where(eq(recurringEdges.eventId, evt.eventId));

  // Fetch matchups so the UI can label each leg with fighter names.
  const eventFights = await db.select().from(fights).where(eq(fights.eventId, evt.eventId));
  const fighterIds = Array.from(
    new Set(eventFights.flatMap((f) => [f.fighterAId, f.fighterBId]).filter((x): x is string => Boolean(x))),
  );
  const fighterRows = fighterIds.length
    ? await db.select().from(fighters).where(inArray(fighters.id, fighterIds))
    : [];
  const fighterById = new Map(fighterRows.map((f) => [f.id, f]));
  const matchupByFightId = new Map(
    eventFights.map((f) => {
      const a = f.fighterAId ? fighterById.get(f.fighterAId) : null;
      const b = f.fighterBId ? fighterById.get(f.fighterBId) : null;
      return [
        f.id,
        `${a?.firstName ?? ""} ${a?.lastName ?? ""} vs ${b?.firstName ?? ""} ${b?.lastName ?? ""}`.trim(),
      ];
    }),
  );

  const rows: RecurringEdgeRow[] = edges.map((e) => ({
    id: e.id,
    fightId: e.fightId,
    betType: e.betType,
    label: e.label,
    appearances: e.appearances,
    totalRuns: e.totalRuns,
    appearancePct: e.appearancePct,
    avgEdge: e.avgEdge,
    avgModelProb: e.avgModelProb,
    latestMarketOdd: e.latestMarketOdd,
    weightClass: e.weightClass,
  }));

  const allCards = (Object.keys(RISK_MODELS) as RiskModel[]).map((model) => ({
    model,
    config: RISK_MODELS[model],
    card: buildCard(rows, model, bankrollUsd),
  }));

  // Decorate legs with the matchup string (UI-only).
  for (const c of allCards) {
    for (const leg of c.card.straights) {
      (leg as unknown as { matchup: string }).matchup = matchupByFightId.get(leg.fightId) ?? "";
    }
    for (const p of c.card.parlays) {
      for (const leg of p.legs) {
        (leg as unknown as { matchup: string }).matchup = matchupByFightId.get(leg.fightId) ?? "";
      }
    }
  }

  // Free-tier teaser: keep only the top elite straight from the balanced card.
  if (!isPro && tier === "free") {
    const balanced = allCards.find((c) => c.model === "balanced");
    const top = balanced?.card.straights[0];
    return NextResponse.json({
      event: { eventId: evt.eventId, name: evt.name, dateTime: evt.dateTime },
      teaser: top ?? null,
      gated: true,
    });
  }

  return NextResponse.json({
    event: { eventId: evt.eventId, name: evt.name, dateTime: evt.dateTime },
    bankrollUsd,
    cards: allCards,
    edgesCount: rows.length,
  });
}
