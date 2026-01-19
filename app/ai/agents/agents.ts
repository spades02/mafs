// app/ai/agents/agents.ts

import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { MAFS_PROMPT } from "@/lib/agents/prompts";
import {
  FightEdgeSummaryGenerationSchema,
  FightEdgeSummary,
} from "@/lib/agents/schemas/fight-edge-summary-schema";
import {
  FightBreakdownType,
  FightBreakdownsSchema,
} from "@/lib/agents/schemas/fight-breakdown-schema";
import { resolveLiveOdds, fetchAllOdds, OddsCache } from "@/lib/odds/resolve-live-odds";
import { whyMafsLikesThis } from "@/lib/agents/schemas/why-mafs-likes-this";
import { buildMafsEventInput } from "@/lib/mafs/fetchFighterStats";

import { americanToDecimal, oddsToProb } from "@/lib/odds/utils";

// ---------------- CONFIG ----------------

const MODEL = "gpt-5.2";
const CONCURRENT_BATCH_SIZE = 3; // Process 3 fights at a time

// ---------------- TYPES ----------------

type FightEdgeWithId = Omit<FightEdgeSummary, 'ev'> & {
  id: number;
  ev: number | null;
  oddsUnavailable?: boolean;
  moneylines: [number, number] | null;
};

export type SimplifiedFight = {
  id: number;
  matchup: string;
  moneylines?: [number, number] | null;
  fighterIds: [number, number];
};

export type SimplifiedEvent = {
  EventId: string;
  Name: string;
  fights: SimplifiedFight[];
};

export type FightResult = {
  type: "fight";
  fightId: number;
  edge: FightEdgeWithId;
  breakdown: FightBreakdownType;
  oddsSource: "api" | "no_match" | "api_error" | "no_api_key";
};

export type StatusUpdate = {
  type: "status";
  phase: "fetching_odds" | "analyzing_card" | "analyzing_fight";
  message: string;
  progress?: {
    current: number;
    total: number;
  };
};

export type ErrorUpdate = {
  type: "fight_error";
  fightId: number;
  matchup: string;
  message: string;
};

type StreamCallback = (update: FightResult | StatusUpdate | ErrorUpdate) => void;

// ---------------- PHASE 1: CARD OVERVIEW ----------------

// Helper: Improved Name Matcher with fuzzy matching
function getBestOddsIndex(
  targetName: string,
  fighter1Name: string,
  fighter2Name: string
): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const target = normalize(targetName);
  const f1 = normalize(fighter1Name);
  const f2 = normalize(fighter2Name);

  // 1. Direct exact match
  if (target === f1) return 0;
  if (target === f2) return 1;

  // 2. Last name match (most reliable)
  const getLastName = (name: string) => name.split(" ").pop() || name;
  const targetLast = getLastName(target);
  const f1Last = getLastName(f1);
  const f2Last = getLastName(f2);

  if (targetLast === f1Last && targetLast !== f2Last) return 0;
  if (targetLast === f2Last && targetLast !== f1Last) return 1;

  // 3. Token overlap (include ALL tokens, no length filter)
  const targetTokens = target.split(" ");

  const countMatches = (name: string) => {
    const nameTokens = name.split(" ");
    return targetTokens.reduce((acc, token) =>
      acc + (nameTokens.some(nt => nt.includes(token) || token.includes(nt)) ? 1 : 0), 0);
  };

  const score1 = countMatches(f1);
  const score2 = countMatches(f2);

  if (score1 > score2) return 0;
  if (score2 > score1) return 1;

  // 4. Substring inclusion as fallback
  if (f1.includes(target) || target.includes(f1)) return 0;
  if (f2.includes(target) || target.includes(f2)) return 1;

  return -1; // No match found
}

async function analyzeCardOverview(event: SimplifiedEvent): Promise<string> {
  // Analyze ALL fights, not just those with odds
  const prompt = `
Analyze this UFC card holistically.

Event: ${event.Name}

FIGHTS:
${event.fights
      .map(
        (f, i) => `
${i + 1}. ${f.matchup}
Moneylines: ${f.moneylines ? f.moneylines.join(" / ") : "N/A"}
`
      )
      .join("\n")}

Return high-level qualitative insights only.
No numbers. No rankings.
`;

  const { text } = await generateText({
    model: openai(MODEL),
    system: MAFS_PROMPT, // Use the persona for consistency
    prompt,
    maxOutputTokens: 900,
  });

  return text;
}

// ---------------- PHASE 2: SINGLE FIGHT ANALYSIS ----------------

async function analyzeFight(
  fight: SimplifiedFight,
  eventName: string,
  cardContext: string,
  mafsEventInputFighters: any[]
): Promise<{ edge: FightEdgeWithId; breakdown: FightBreakdownType }> {

  // 1. Setup Fighters
  const fighter1 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[0]);
  const fighter2 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[1]);

  // Handle Missing Odds gracefully for the prompt
  const moneylineText = fight.moneylines
    ? fight.moneylines.join(" / ")
    : "N/A (No odds available)";

  // -------- AGENT 1: EDGE CALCULATION --------
  const { object: edgeObj } = await generateObject({
    model: openai(MODEL),
    schema: FightEdgeSummaryGenerationSchema,
    system: MAFS_PROMPT,
    maxRetries: 3,
    prompt: `
CARD CONTEXT:
${cardContext.slice(0, 500)}

EVENT: ${eventName}
MATCHUP: ${fight.matchup}
MONEYLINES: ${moneylineText}

STATS:
- ${fighter1?.name}: ${JSON.stringify(fighter1 ?? {})}
- ${fighter2?.name}: ${JSON.stringify(fighter2 ?? {})}

TASK:
1. Estimate "truthProbability" (Win %) based ONLY on stats.
2. If MONEYLINES are "N/A", ignore EV and just pick the winner.
3. REALITY CHECK: If a fighter is +200, they are an underdog. Do not give them >60% win chance.

Return ONE object.
`,
  });

  // ---------------------------------------------------------
  // ⚡️ FINAL FIX: DATA RECONCILIATION
  // ---------------------------------------------------------

  const chosenWinnerName = edgeObj.bet.toLowerCase();
  const f1Name = fighter1?.name || "Unknown";
  const f2Name = fighter2?.name || "Unknown";

  // 1. Use Token Matcher to find WHICH odds belong to the winner
  // Returns 0 (fighter1), 1 (fighter2), or -1 (Unknown)
  const matchedIndex = getBestOddsIndex(chosenWinnerName, f1Name, f2Name);

  // Fix: Clean up bet name if AI hallucinated odds into it (e.g. "Fighter A (-150)")
  if (edgeObj.bet) {
    edgeObj.bet = edgeObj.bet.replace(/\s*[\(\[]?[+-]\d+[\)\]]?\s*$/, '').trim();
  }

  // 2. Grab the specific odd
  let marketOdd = 0;
  if (matchedIndex !== -1 && fight.moneylines && fight.moneylines[matchedIndex] !== undefined) {
    marketOdd = fight.moneylines[matchedIndex];
  }

  // 3. Validate AI Probability (Fix 5: Better validation)
  let rawProb = edgeObj.truthProbability;
  if (rawProb > 1 && rawProb <= 100) {
    // AI returned percentage instead of decimal
    rawProb = rawProb / 100;
  } else if (rawProb > 100 || rawProb < 0) {
    // Invalid probability, default to market implied or 50%
    console.warn(`Invalid probability: ${rawProb}, defaulting`);
    rawProb = 0.5;
  }

  // 4. Dampener Logic (Prevent 99.9% EV)
  const getImpliedProb = (odds: number) => {
    if (odds === 0) return 0.5; // Neutral fallback
    return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
  };

  const marketImpliedProb = getImpliedProb(marketOdd);
  const MAX_EDGE = 0.25;
  let finalProb = rawProb;

  // Only dampen if we actually HAVE odds
  if (marketOdd !== 0 && (rawProb - marketImpliedProb > MAX_EDGE)) {
    finalProb = marketImpliedProb + MAX_EDGE;
  }

  // 5. Calculate EV (Fix 2 & 3: Handle missing odds and preserve negative EV)
  let calculatedEvPercent: number | null = null;
  let oddsUnavailable = false;
  const isNoBetIntent = chosenWinnerName.includes("no bet") || chosenWinnerName.includes("pass") || chosenWinnerName.includes("pick'em") || chosenWinnerName.includes("pick em") || chosenWinnerName.includes("coin-flip") || chosenWinnerName.includes("either fighter");

  if (isNoBetIntent || (marketOdd === 0 && fight.moneylines)) {
    // 1. AI intentionally passed
    // 2. OR Odds exist but name matching failed (AI hallucinated a name) -> Treat as No Bet
    calculatedEvPercent = 0;
    oddsUnavailable = false;
  } else if (marketOdd === 0 && !fight.moneylines) {
    // No odds available at all
    oddsUnavailable = true;
    calculatedEvPercent = null;
  } else {
    // Odds are available and name matching succeeded
    const decimalOdds = americanToDecimal(marketOdd);
    const rawEv = (finalProb * decimalOdds) - 1;
    calculatedEvPercent = parseFloat((rawEv * 100).toFixed(2));
  }

  // 6. Hard Cap only (Fix 3: Preserve negative EV, don't convert to 0)
  if (calculatedEvPercent !== null && calculatedEvPercent > 100) {
    calculatedEvPercent = 99.9; // Visual cap
  }

  // 7. Fix Confidence Display (0.58 -> 58)
  let finalConfidence = edgeObj.confidence || 0;
  if (finalConfidence <= 1 && finalConfidence > 0) finalConfidence *= 100;

  // Normalize rationale
  const normalizedRationale = whyMafsLikesThis.parse(edgeObj.rationale);

  const edgeWithId: FightEdgeWithId = {
    id: fight.id,
    rank: edgeObj.rank || 0,
    fight: edgeObj.fight,
    methodOfVictory: edgeObj.methodOfVictory,
    bet: edgeObj.bet,
    score: edgeObj.score || 0,
    ev: calculatedEvPercent,
    oddsUnavailable, // Fix 2: Flag for missing odds
    truthProbability: finalProb,
    marketProbability: marketImpliedProb,
    confidence: finalConfidence,
    risk: edgeObj.risk || 0,
    tier: edgeObj.tier || "No Bet",
    recommendedStake: edgeObj.recommendedStake || 0,
    rationale: normalizedRationale,
    moneylines: fight.moneylines || null,
  };

  // -------- AGENT 2: BREAKDOWN WRITER --------
  const { object: bdObj } = await generateObject({
    model: openai(MODEL),
    schema: FightBreakdownsSchema,
    system: MAFS_PROMPT,
    prompt: `
EVENT: ${eventName}
FIGHT: ${fight.matchup}
WINNER PICK: ${edgeWithId.bet}
ODDS: ${marketOdd} (Implied: ${(marketImpliedProb * 100).toFixed(1)}%)
MY WIN PROB: ${(finalProb * 100).toFixed(1)}%
EV: ${edgeWithId.ev}%

Write a breakdown explaining this edge.
`,
  });

  // Inject strict data into breakdown
  // We use the same matchedIndex to ensure consistency
  let realBreakdownOdds: string | number = marketOdd;
  let realFighterName = matchedIndex === 0 ? f1Name : (matchedIndex === 1 ? f2Name : bdObj.breakdowns[0].marketLine.fighter);

  // Correction: If we have odds but no specific bet (marketOdd == 0), show the full lines with names
  if (marketOdd === 0) {
    if (fight.moneylines) {
      const parts = fight.matchup.split(" vs ");
      const name1 = parts[0] ? (parts[0].split(" ").pop() || parts[0]) : "F1";
      const name2 = parts[1] ? (parts[1].split(" ").pop() || parts[1]) : "F2";
      realBreakdownOdds = `${name1} ${fight.moneylines[0]} / ${name2} ${fight.moneylines[1]}`;
      realFighterName = "Market Lines";
    } else {
      realBreakdownOdds = "No Odds";
    }
  }

  const injectedMarketLine = {
    fighter: realFighterName,
    odds: realBreakdownOdds,
    prob: marketOdd === 0 ? "N/A" : parseFloat(getImpliedProb(marketOdd).toFixed(4)),
  };

  const finalBreakdown = {
    ...bdObj.breakdowns[0],
    marketLine: injectedMarketLine
  };

  return { edge: edgeWithId, breakdown: finalBreakdown };
}

// ---------------- MAIN EXPORT ----------------

export default async function Agents(
  event: SimplifiedEvent,
  onStreamUpdate?: StreamCallback
) {
  // 1. Fetch Fighter Profiles
  const mafsEventInput = await buildMafsEventInput(
    event.fights.flatMap((f) =>
      f.fighterIds.map((id, idx) => ({
        id,
        name: f.matchup.split(" vs ")[idx].trim(),
      }))
    )
  );

  // 2. Resolve Live Odds (Fix 7: Batch fetch upfront)
  const oddsSourceMap = new Map<number, FightResult["oddsSource"]>();
  onStreamUpdate?.({
    type: "status",
    phase: "fetching_odds",
    message: "Resolving live odds",
  });

  // Fetch all odds once and reuse for all fights
  const { cache: oddsCache } = await fetchAllOdds();

  for (const fight of event.fights) {
    const res = await resolveLiveOdds(fight.matchup, oddsCache);
    fight.moneylines = res.odds;
    oddsSourceMap.set(fight.id, res.source);
  }

  // 3. Card Overview
  onStreamUpdate?.({
    type: "status",
    phase: "analyzing_card",
    message: "Analyzing full card holistically",
  });
  const cardContext = await analyzeCardOverview(event);

  // 4. Batch Processing of Fights
  const results: FightResult[] = [];
  const fightsToAnalyze = event.fights; // ✅ Analyze ALL fights
  let completed = 0;

  for (let i = 0; i < fightsToAnalyze.length; i += CONCURRENT_BATCH_SIZE) {
    const batch = fightsToAnalyze.slice(i, i + CONCURRENT_BATCH_SIZE);

    const batchPromises = batch.map(async (fight) => {
      onStreamUpdate?.({
        type: "status",
        phase: "analyzing_fight",
        message: `Analyzing ${fight.matchup}`,
        progress: { current: completed + 1, total: fightsToAnalyze.length },
      });

      try {
        const { edge, breakdown } = await analyzeFight(
          fight,
          event.Name,
          cardContext,
          mafsEventInput.fighters
        );

        const payload: FightResult = {
          type: "fight",
          fightId: fight.id,
          edge,
          breakdown,
          oddsSource: oddsSourceMap.get(fight.id)!,
        };

        onStreamUpdate?.(payload);
        results.push(payload);
      } catch (err: any) {
        console.error(`✗ Fight failed: ${fight.matchup}`, err.message);

        // FALLBACK: If AI fails, still return the fight with the odds we found
        const fallbackMoneylines = fight.moneylines || null;
        const fallbackMarketOdd = fallbackMoneylines ? fallbackMoneylines[0] : 0; // Default to first fighter? Or try to match?
        // Since we don't know the winner, we can't do the "matchedIndex" logic perfectly.
        // But usually moneylines[0] corresponds to fighter1 and moneylines[1] to fighter2.

        const fallbackEdge: FightEdgeWithId = {
          id: fight.id,
          rank: 999, // Low rank
          fight: fight.matchup,
          methodOfVictory: "N/A",
          bet: "No Bet",
          score: 0,
          ev: 0,
          oddsUnavailable: !fallbackMoneylines,
          truthProbability: 0.5,
          marketProbability: 0.5,
          confidence: 0,
          risk: 0,
          tier: "No Bet",
          recommendedStake: 0,
          rationale: {
            title: "Analysis Unavailable",
            sections: {
              marketInefficiencyDetected: [],
              matchupDrivers: [],
              dataSignalsAligned: [],
              riskFactors: ["AI Analysis Failed"],
              whyThisLineNotOthers: []
            },
            whyThisLineNotOthers: [],
            summary: `AI analysis failed: ${err.message}. Showing market odds only.`
          },
          moneylines: fallbackMoneylines,
        };

        // Helper to format fallback odds with names
        let formattedFallbackOdds = "No Odds";
        if (fallbackMoneylines) {
          const parts = fight.matchup.split(" vs ");
          const name1 = parts[0] ? (parts[0].split(" ").pop() || parts[0]) : "F1";
          const name2 = parts[1] ? (parts[1].split(" ").pop() || parts[1]) : "F2";
          formattedFallbackOdds = `${name1} ${fallbackMoneylines[0]} / ${name2} ${fallbackMoneylines[1]}`;
        }

        const fallbackBreakdown: FightBreakdownType = {
          fight: fight.matchup,
          edge: 0,
          ev: 0,
          score: 0,
          trueLine: { fighter: "Unknown", odds: 0, prob: 0.5 },
          marketLine: {
            fighter: "Market Lines",
            odds: formattedFallbackOdds,
            prob: 0.5
          },
          mispricing: 0,
          recommendedBet: "No Bet",
          betEv: 0,
          confidence: 0,
          risk: 0,
          stake: 0,
          fighter1: { name: fight.matchup.split(" vs ")[0] || "Fighter 1", notes: [] },
          fighter2: { name: fight.matchup.split(" vs ")[1] || "Fighter 2", notes: [] },
          pathToVictory: [],
          whyLineExists: ["AI Analysis Failed"]
        };

        const payload: FightResult = {
          type: "fight",
          fightId: fight.id,
          edge: fallbackEdge,
          breakdown: fallbackBreakdown,
          oddsSource: oddsSourceMap.get(fight.id) || "api_error",
        };

        // Notify frontend correctly (as a result, not just an error)
        onStreamUpdate?.(payload);
        results.push(payload);

        // Also stream the error message so the UI can optionally show a toast/alert
        onStreamUpdate?.({
          type: "fight_error",
          fightId: fight.id,
          matchup: fight.matchup,
          message: err.message || "Analysis failed",
        });
      } finally {
        completed++;
      }
    });

    await Promise.all(batchPromises);
  }

  // 5. Post-Processing: Sort & Rank
  // Sort by EV (descending) so the best bets are #1
  // Handle null EV by treating it as -Infinity for sorting (goes to end)
  results.sort((a, b) => (b.edge.ev ?? -Infinity) - (a.edge.ev ?? -Infinity));

  // Re-assign ranks based on sorted order
  results.forEach((r, i) => {
    r.edge.rank = i + 1;
  });

  return {
    mafsCoreEngine: results.map((r) => r.edge),
    fightBreakdowns: Object.fromEntries(
      results.map((r) => [r.fightId, r.breakdown])
    ),
  };
}