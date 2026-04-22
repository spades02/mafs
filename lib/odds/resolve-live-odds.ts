// lib/odds/resolve-live-odds.ts
// Resolves live odds from mma_odds_data table (full props suite)

import { db } from "@/db/client";
import { mmaOddsData } from "@/db/schema/mma-odds-data-schema";
import { or, ilike } from "drizzle-orm";

export type FighterOdds = {
  moneyline: number | null;
  koTko: number | null;
  submission: number | null;
  decision: number | null;
  itdYes: number | null;
  itdNo: number | null;
  over1_5: number | null;
  under1_5: number | null;
  over2_5: number | null;
  under2_5: number | null;
  over3_5: number | null;
  under3_5: number | null;
  round1Finish: number | null;
  round2Finish: number | null;
  round3Finish: number | null;
  winByDecision: number | null;
  fightGoesToDecision: number | null;
  fightNotGoToDecision: number | null;
  draw: number | null;
};

export type OddsResult = {
  odds: [number, number] | null;
  fighterA: FighterOdds | null;
  fighterB: FighterOdds | null;
  source: 'database' | 'no_match';
  bookmaker?: string;
};

function normalize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function lastName(name: string) {
  return name.trim().split(/\s+/).pop() || name;
}

// The DB stores odds as text. Empty strings ("") leak through `?? null` because
// `??` only catches null/undefined. Downstream code then treats the empty string
// as a populated value and either coerces it to 0 or skips sibling-row fallbacks.
// Normalize every field to a finite number or null here.
function toOdd(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n !== 0 ? n : null;
}

function rowToFighterOdds(row: typeof mmaOddsData.$inferSelect): FighterOdds {
  return {
    moneyline: toOdd(row.moneylineOdds),
    koTko: toOdd(row.methodKoTkoOdds),
    submission: toOdd(row.methodSubmissionOdds),
    decision: toOdd(row.methodDecisionOdds),
    itdYes: toOdd(row.insideDistanceYesOdds),
    itdNo: toOdd(row.insideDistanceNoOdds),
    over1_5: toOdd(row.over1_5Odds),
    under1_5: toOdd(row.under1_5Odds),
    over2_5: toOdd(row.over2_5Odds),
    under2_5: toOdd(row.under2_5Odds),
    over3_5: toOdd(row.over3_5Odds),
    under3_5: toOdd(row.under3_5Odds),
    round1Finish: toOdd(row.round1FinishOdds),
    round2Finish: toOdd(row.round2FinishOdds),
    round3Finish: toOdd(row.round3FinishOdds),
    winByDecision: toOdd(row.fighterWinByDecisionOdds),
    fightGoesToDecision: toOdd(row.fightGoesToDecisionOdds),
    fightNotGoToDecision: toOdd(row.fightNotGoToDecisionOdds),
    draw: toOdd(row.drawOdds),
  };
}

export async function resolveLiveOdds(matchup: string): Promise<OddsResult> {
  const parts = matchup.split(/ vs\.? /i);
  const fighterA = parts[0]?.trim();
  const fighterB = parts[1]?.trim();

  if (!fighterA || !fighterB) {
    console.warn(`⚠ Invalid matchup format: ${matchup}`);
    return { odds: null, fighterA: null, fighterB: null, source: 'no_match' };
  }

  try {
    const lastA = lastName(fighterA);
    const lastB = lastName(fighterB);

    const rows = await db
      .select()
      .from(mmaOddsData)
      .where(
        or(
          ilike(mmaOddsData.fighter, `%${lastA}%`),
          ilike(mmaOddsData.fighter, `%${lastB}%`)
        )
      );

    if (rows.length === 0) {
      console.warn(`⚠ No odds found in mma_odds_data for: ${matchup}`);
      return { odds: null, fighterA: null, fighterB: null, source: 'no_match' };
    }

    const normA = normalize(fighterA);
    const normB = normalize(fighterB);

    const findBestRow = (targetNorm: string) => {
      const targetLast = normalize(lastName(targetNorm));
      // Prefer exact full-name match, fall back to last-name match
      const exact = rows.find(r => normalize(r.fighter ?? '') === targetNorm);
      if (exact) return exact;
      return rows.find(r => {
        const rn = normalize(r.fighter ?? '');
        return rn.includes(targetLast) || targetLast.includes(rn.split(' ').pop() || '');
      });
    };

    const rowA = findBestRow(normA);
    const rowB = findBestRow(normB);

    if (!rowA && !rowB) {
      console.warn(`⚠ No fighter matches in mma_odds_data for: ${matchup}`);
      return { odds: null, fighterA: null, fighterB: null, source: 'no_match' };
    }

    const oddsA = rowA ? rowToFighterOdds(rowA) : null;
    const oddsB = rowB ? rowToFighterOdds(rowB) : null;

    const mlA = oddsA?.moneyline ?? null;
    const mlB = oddsB?.moneyline ?? null;
    const mlPair: [number, number] | null =
      mlA !== null && mlB !== null ? [mlA, mlB] : null;

    const bookmaker = rowA?.bookmaker ?? rowB?.bookmaker ?? undefined;

    console.log(`✓ Props odds found in mma_odds_data: ${matchup} (${bookmaker ?? 'unknown bookmaker'})`);
    return {
      odds: mlPair,
      fighterA: oddsA,
      fighterB: oddsB,
      source: 'database',
      bookmaker,
    };
  } catch (e) {
    console.error("mma_odds_data check failed", e);
    return { odds: null, fighterA: null, fighterB: null, source: 'no_match' };
  }
}
