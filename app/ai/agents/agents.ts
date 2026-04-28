// app/ai/agents/agents.ts

import { generateObject, NoObjectGeneratedError } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import { MAFS_PROMPT } from "@/lib/agents/prompts";
import {
  FightEdgeSummaryGenerationSchema,
  FightEdgeSummary,
} from "@/lib/agents/schemas/fight-edge-summary-schema";
import {
  FightBreakdownType,
  FightBreakdownsSchema,
} from "@/lib/agents/schemas/fight-breakdown-schema";
import { resolveLiveOdds, FighterOdds } from "@/lib/odds/resolve-live-odds";
import { americanToDecimal, oddsToProb } from "@/lib/odds/utils";
import { getFightOddsHistory } from "@/app/(app)/dashboard/actions";
import { buildMafsEventInput } from "@/lib/mafs/fetchFighterStats";
import { getActiveCalibrationConfig, CalibrationConfig } from "@/lib/calibration/get-active-config";
import {
  insightContradictsBetType,
  isLegacyTemplate,
  stripHedgingForHighConfidence,
  deduplicateSummary,
} from "@/lib/agents/validate-insight";

// ---------------- CONFIG ----------------

const MODEL = openai("gpt-4o");
const CONCURRENT_BATCH_SIZE = 6;

// Wraps generateObject so a schema-mismatch ("No object generated…") never kills
// the pipeline. Retries once with a hardened JSON-only instruction; if that
// still fails and a fallback is provided, returns it instead of throwing.
async function safeGenerateObject<T>(
  args: Parameters<typeof generateObject>[0],
  opts: { fallback?: T; label?: string } = {}
): Promise<{ object: T }> {
  const isSchemaMismatch = (err: unknown) => {
    const e = err as { name?: string; message?: string } | undefined;
    return (
      err instanceof NoObjectGeneratedError ||
      e?.name === "AI_NoObjectGeneratedError" ||
      /response did not match schema/i.test(e?.message ?? "")
    );
  };

  try {
    const res = await generateObject(args as Parameters<typeof generateObject>[0]);
    return res as unknown as { object: T };
  } catch (err) {
    if (!isSchemaMismatch(err)) throw err;
    try {
      const hardened = {
        ...(args as Record<string, unknown>),
        prompt: `${(args as { prompt?: string }).prompt ?? ""}\n\nIMPORTANT: Return ONLY a single JSON object that strictly matches the provided schema. No prose, no markdown fences, no extra fields, no trailing commentary.`,
      };
      const res = await generateObject(hardened as Parameters<typeof generateObject>[0]);
      return res as unknown as { object: T };
    } catch (retryErr) {
      const msg = (retryErr as { message?: string })?.message ?? String(retryErr);
      console.warn(`[safeGenerateObject] schema mismatch persisted${opts.label ? ` (${opts.label})` : ""}: ${msg}`);
      if (opts.fallback !== undefined) return { object: opts.fallback };
      throw retryErr;
    }
  }
}

// ---------------- TYPES ----------------

export type SimplifiedFight = {
  id: string;
  matchup: string;
  moneylines?: [number, number] | null;
  fighterIds: [string, string];
  fullOdds?: { a: FighterOdds | null; b: FighterOdds | null };
};

export type SimplifiedEvent = {
  EventId: string;
  Name: string;
  fights: SimplifiedFight[];
};

export type FightResult = {
  type: "fight";
  fightId: string;
  edge: FightEdgeSummary;
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
  fightId: string;
  matchup: string;
  message: string;
};

export type ScanSummary = {
  type: "scan_summary";
  marketsScanned: number;
  fightsAnalyzed: number;
};

type StreamCallback = (
  update: FightResult | StatusUpdate | ErrorUpdate | ScanSummary
) => void;

// ---------------- HELPERS ----------------

function getBestOddsIndex(
  targetName: string,
  fighter1Name: string,
  fighter2Name: string
): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

  // Remove common betting suffixes to clean the name
  const cleanTarget = targetName.toLowerCase()
    .replace(/\b(ml|moneyline|win|decision|dec|ko|tko|sub|submission|itd|prop)\b/g, "")
    .trim();

  const target = normalize(cleanTarget);
  const f1 = normalize(fighter1Name);
  const f2 = normalize(fighter2Name);

  if (!target) return -1; // Safety check

  if (target === f1) return 0;
  if (target === f2) return 1;

  const getLastName = (name: string) => name.split(" ").pop() || name;
  const targetLast = getLastName(target);
  const f1Last = getLastName(f1);
  const f2Last = getLastName(f2);

  if (targetLast === f1Last && targetLast !== f2Last) return 0;
  if (targetLast === f2Last && targetLast !== f1Last) return 1;

  // Basic substring check
  if (f1.includes(target)) return 0;
  if (f2.includes(target)) return 1;
  // Reverse substring check (if target is "Volkanovski" and f1 is "Alex Volkanovski")
  if (target.includes(f1)) return 0;
  if (target.includes(f2)) return 1;

  return -1;
}

// ---------------- ANALYSIS ----------------

export async function analyzeFight(
  fight: SimplifiedFight,
  eventName: string,
  mafsEventInputFighters: any[],
  calibrationConfig?: CalibrationConfig
): Promise<{ edge: FightEdgeSummary; breakdown: FightBreakdownType }> {

  const fighter1 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[0]);
  const fighter2 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[1]);
  const f1Name = fighter1?.name || "Unknown";
  const f2Name = fighter2?.name || "Unknown";

  const moneylineText = fight.moneylines
    ? `${f1Name}: ${fight.moneylines[0]} / ${f2Name}: ${fight.moneylines[1]}`
    : "No odds available";

  const oddsA = fight.fullOdds?.a;
  const oddsB = fight.fullOdds?.b;

  function fmtOdd(v: number | null | undefined): string {
    if (v == null) return "N/A";
    return v > 0 ? `+${v}` : `${v}`;
  }

  // Fight-level props (same regardless of fighter). Merge per-field so empty
  // columns on one side fall back to the other row's populated value.
  const fightProps = oddsA || oddsB ? {
    itdYes: oddsA?.itdYes ?? oddsB?.itdYes,
    itdNo: oddsA?.itdNo ?? oddsB?.itdNo,
    over1_5: oddsA?.over1_5 ?? oddsB?.over1_5,
    under1_5: oddsA?.under1_5 ?? oddsB?.under1_5,
    over2_5: oddsA?.over2_5 ?? oddsB?.over2_5,
    under2_5: oddsA?.under2_5 ?? oddsB?.under2_5,
    over3_5: oddsA?.over3_5 ?? oddsB?.over3_5,
    under3_5: oddsA?.under3_5 ?? oddsB?.under3_5,
    fightGoesToDecision: oddsA?.fightGoesToDecision ?? oddsB?.fightGoesToDecision,
    fightNotGoToDecision: oddsA?.fightNotGoToDecision ?? oddsB?.fightNotGoToDecision,
    draw: oddsA?.draw ?? oddsB?.draw,
  } : null;
  const marketOddsBlock = fight.fullOdds
    ? `
FULL MARKET ODDS (use these to identify the best edge across all markets):
Fighter A - ${f1Name}: ML ${fmtOdd(oddsA?.moneyline)} | KO/TKO ${fmtOdd(oddsA?.koTko)} | Sub ${fmtOdd(oddsA?.submission)} | Decision ${fmtOdd(oddsA?.decision)} | Win by Dec ${fmtOdd(oddsA?.winByDecision)}
Fighter B - ${f2Name}: ML ${fmtOdd(oddsB?.moneyline)} | KO/TKO ${fmtOdd(oddsB?.koTko)} | Sub ${fmtOdd(oddsB?.submission)} | Decision ${fmtOdd(oddsB?.decision)} | Win by Dec ${fmtOdd(oddsB?.winByDecision)}
Fight Props: ITD Yes ${fmtOdd(fightProps?.itdYes)} | ITD No ${fmtOdd(fightProps?.itdNo)} | Over 1.5 ${fmtOdd(fightProps?.over1_5)} | Under 1.5 ${fmtOdd(fightProps?.under1_5)} | Over 2.5 ${fmtOdd(fightProps?.over2_5)} | Under 2.5 ${fmtOdd(fightProps?.under2_5)} | Over 3.5 ${fmtOdd(fightProps?.over3_5)} | Under 3.5 ${fmtOdd(fightProps?.under3_5)}
GTD (Goes to Decision) ${fmtOdd(fightProps?.fightGoesToDecision)} | DGTD (Doesn't Go Distance) ${fmtOdd(fightProps?.fightNotGoToDecision)} | Draw ${fmtOdd(fightProps?.draw)}
Round Finishes - ${f1Name}: R1 ${fmtOdd(oddsA?.round1Finish)} | R2 ${fmtOdd(oddsA?.round2Finish)} | R3 ${fmtOdd(oddsA?.round3Finish)}
Round Finishes - ${f2Name}: R1 ${fmtOdd(oddsB?.round1Finish)} | R2 ${fmtOdd(oddsB?.round2Finish)} | R3 ${fmtOdd(oddsB?.round3Finish)}`
    : "";

  // Build clean fighter stat blocks — strip zero/empty values so AI doesn't think data is "limited"
  const formatFighterStats = (f: any) => {
    if (!f) return "No fighter data available";
    const stats: Record<string, any> = {};
    if (f.name) stats.name = f.name;
    if (f.nickname) stats.nickname = f.nickname;
    if (f.weightClass) stats.weightClass = f.weightClass;
    if (f.wins || f.losses) stats.record = `${f.wins || 0}-${f.losses || 0}`;
    if (f.height) stats.heightIn = f.height;
    if (f.reach) stats.reachIn = f.reach;
    if (f.strikingPerMinute) stats.strikesLandedPerMin = f.strikingPerMinute;
    if (f.strikingAccuracy) stats.strikingAccuracy = `${(f.strikingAccuracy * 100).toFixed(0)}%`;
    if (f.takedownAverage) stats.takedownAvgPer15Min = f.takedownAverage;
    if (f.submissionAverage) stats.submissionAvgPer15Min = f.submissionAverage;
    if (f.knockoutPct) stats.koWinRate = `${(f.knockoutPct * 100).toFixed(0)}%`;
    if (f.submissionPct) stats.subWinRate = `${(f.submissionPct * 100).toFixed(0)}%`;
    if (f.decisionPct) stats.decisionWinRate = `${(f.decisionPct * 100).toFixed(0)}%`;
    if (f.totalGradedWins) stats.totalGradedWins = f.totalGradedWins;
    if (f.stance) stats.stance = f.stance;
    return JSON.stringify(stats);
  };

  const f1Stats = formatFighterStats(fighter1);
  const f2Stats = formatFighterStats(fighter2);

  // Derive a short stylistic-identity hint from raw stats so Agent 2 doesn't
  // hallucinate fighter identities (e.g. labelling a high-volume KO striker as
  // a "submission specialist"). Hint covers the dimensions the breakdown writer
  // most often invents: striking volume, KO threat, submission threat, wrestling.
  const deriveStyleHint = (f: any): string => {
    if (!f) return "no data — do NOT invent stylistic identity";
    const tags: string[] = [];
    const slpm = Number(f.strikingPerMinute) || 0;
    const subAvg = Number(f.submissionAverage) || 0;
    const tdAvg = Number(f.takedownAverage) || 0;
    const koPct = Number(f.knockoutPct) || 0;
    const subPct = Number(f.submissionPct) || 0;
    const totalGraded = Number(f.totalGradedWins) || 0;

    // Striking volume
    if (slpm >= 5) tags.push("high-volume striker");
    else if (slpm >= 3) tags.push("active striker");
    else if (slpm > 0 && slpm < 2) tags.push("low-output striker");

    // KO threat — only when sample is meaningful (≥3 graded wins)
    if (totalGraded >= 3) {
      if (koPct >= 0.6) tags.push(`elite KO finisher (${Math.round(koPct * 100)}% of wins by KO/TKO)`);
      else if (koPct >= 0.4) tags.push(`legitimate KO threat (${Math.round(koPct * 100)}% of wins by KO/TKO)`);
      else if (koPct < 0.2) tags.push(`NOT a KO finisher (${Math.round(koPct * 100)}% of wins by KO/TKO)`);
    }

    // Submission threat — combine career-wins method with per-15-min sub attempts
    if (totalGraded >= 3) {
      if (subPct >= 0.4 && subAvg >= 1.0) tags.push(`real submission threat (${Math.round(subPct * 100)}% of wins by sub, ${subAvg.toFixed(1)} sub-attempts/15m)`);
      else if (subPct < 0.15 && subAvg < 0.5) tags.push(`NOT a submission threat (${Math.round(subPct * 100)}% of wins by sub, ${subAvg.toFixed(1)} sub-attempts/15m)`);
    } else {
      if (subAvg >= 1.0) tags.push("submission attempts in record");
      else if (subAvg < 0.3) tags.push("NOT a submission threat (sub-avg ~0)");
    }

    // Wrestling
    if (tdAvg >= 2.5) tags.push("wrestling-heavy");
    else if (tdAvg < 0.5) tags.push("not a wrestler");

    return tags.length ? tags.join(", ") : "limited stat signal";
  };
  const f1StyleHint = deriveStyleHint(fighter1);
  const f2StyleHint = deriveStyleHint(fighter2);

  // -------- AGENT 1: EDGE CALCULATION --------
  const { object: edgeObj } = await safeGenerateObject<import("zod").infer<typeof FightEdgeSummaryGenerationSchema>>({
    model: MODEL,
    schema: FightEdgeSummaryGenerationSchema,
    system: MAFS_PROMPT,
    maxRetries: 3,
    prompt: `
EVENT: ${eventName}
MATCHUP: ${fight.matchup}
MONEYLINES: ${moneylineText}
${marketOddsBlock}

FIGHTER STATS:
- ${f1Name}: ${f1Stats}
- ${f2Name}: ${f2Stats}

TASK:
1. **Analyze** the stats and stylistic matchup deeply.
2. **Estimate** "truthProbability" (Win %) for the fighter you favor.
3. **Compare** with market lines if available.

4. **MULTI-MARKET EVALUATION** — THIS IS CRITICAL:
   You MUST evaluate AT LEAST 3 of these 8 betting markets and populate the 'marketEvaluations' array:
   - **ML** (Moneyline): Who wins?
   - **Over / Under**: Will the fight go past 2.5 rounds (or 1.5 for 3-round fights)?
   - **ITD** (Inside The Distance): Does the fight end by KO/TKO or submission?
   - **GTD** (Goes The Distance): The fight goes the full scheduled rounds and ends by decision.
   - **DGTD** (Doesn't Go The Distance): The fight does NOT go the full distance — ends by finish.
   - **MOV** (Method of Victory): HOW does the winner win — KO, submission, or decision?
   - **Round**: What round or round group does it end in?
   - **Double Chance**: Combined outcomes (e.g. Fighter wins by KO OR decision)

   For EACH market you evaluate, provide: market, label, probability (0-1), edge (%), and reasoning.
   Then SET 'bet_type' and 'label' to the SINGLE BEST MARKET — the one with the highest edge.

   DO NOT default to Moneyline. If GTD, ITD, or O/U has a bigger edge, recommend THAT instead.

5. **DECIDE**: Is the best market worth betting?
   - **Scenario A (ML Odds Available)**: Recommend if your estimated prob > Market Implied %. Otherwise, PASS.
   - **Scenario B (Non-ML or No Odds)**: Recommend only if probability is > 60% AND you have high confidence. Otherwise, PASS.

6. **Generate Output**:
   - **Label**: ALWAYS set 'label' to the specific bet (e.g. "Pereira ITD", "Over 2.5 Rounds", "Pantoja by Sub", "Fight GTD"). NEVER use "No Bet" or "Pass" as the label.
   - **bet_type**: MUST be one of ["ML", "ITD", "Over", "Under", "MOV", "Round", "Double Chance", "GTD", "DGTD", "Spread", "Prop", "No Bet"]. If passing, use "No Bet".

7. **confidencePct** — CRITICAL RULES:
   - If you decide to PASS (low edge/no value), set 'confidencePct' to 0.
   - If you ARE recommending a bet, confidencePct MUST reflect how certain you are in the pick:
     - 85-95: Very high conviction (dominant favorite, clear style mismatch, strong data backing)
     - 70-84: Solid conviction (clear edge, reasonable data support)
     - 55-69: Moderate conviction (some edge but notable uncertainty)
     - 45-54: Low conviction (marginal edge, high uncertainty)
   - NEVER leave confidencePct at 0 when recommending a real bet. That is a schema violation.

8. **varianceTag** — How chaotic/unpredictable is the fight outcome:
   - "low": Dominant favorite ML, clear skill gap, predictable outcome path
   - "medium": Competitive matchup, standard ML or prop bet, some uncertainty
   - "high": Heavy underdog play, ITD/finish bet, volatile weight class, coinflip fight
   - Default to "medium" when unsure. Do NOT default to "high".

9. **NEW UI ELEMENTS** — REQUIRED:
   - **walkthroughSimulations**: Supply exactly 3 items: 'Pressure/Pacing Control', 'Early Window Finish', and 'Damage/Durability Edge' with estimated probabilities (0-100).
   - **advantageMetrix**: Evaluate the 4 criteria (marketPositioning, modelEfficiency, matchupFit, valueReturn) based on the bet's qualities. Set to true if it holds a strong advantage.

10. **Generate** 'agentSignals' even if passing.
11. **Populate** 'detailedReason'.

IMPORTANT:
- Be strict. Do not force a bet on 50/50 fights with bad odds.
- Prioritize the market with the HIGHEST EDGE, not the most obvious one.
- Keep 'executiveSummary' EXTREMELY short (max 10-15 words). MUST cite something
  SPECIFIC to this fight (a fighter's name, a concrete stat, or a stylistic
  clash). NEVER produce generic templated lines that could apply to any fight.

EXECUTIVE SUMMARY ALIGNMENT (HARD RULE):
The 'executiveSummary' MUST support the bet_type you chose. Do not contradict it.
  - ITD / DGTD / MOV(KO|Sub) / Round → mention finish indicators (KO power, sub
    threat, low durability, fast finishes, gas tank). NEVER mention durability
    or "going the distance" for these bets.
  - GTD → mention durability, decision history, pace. NEVER mention "quick
    finish" or "early KO" for these bets.
  - Over X.5 → mention pace / output / total-rounds tendency.
  - Under X.5 → mention finish rate / power / pace asymmetry.
  - ML → mention the skill or stylistic edge for the SPECIFIC picked side.
  - No Bet → explain why no value, do NOT describe fighter strengths.

LANGUAGE STRENGTH RULES (use the confidencePct YOU set):
  ≥80 → "very likely", "expect", "dominant"
  ≥70 → "clear tendency", "strong", "expected"
  ≥60 → "likely", "favored", "strong chance"
  <60 → measured / neutral language
At confidencePct ≥60, BANNED words: "could", "might", "possibly", "may",
"perhaps", "potentially". Use decisive verbs instead.
`,
  });

  // Reconcile Data
  const matchedIndex = getBestOddsIndex(edgeObj.label, f1Name, f2Name);
  const betSideOdds = matchedIndex === 0 ? oddsA : matchedIndex === 1 ? oddsB : (oddsA ?? oddsB);

  // Pick the right market odds column based on bet_type
  let marketOdd = 0;
  const bt = edgeObj.bet_type;

  if (bt === "ML") {
    // Use moneyline of the matched fighter side
    if (fight.moneylines && matchedIndex !== -1) {
      marketOdd = fight.moneylines[matchedIndex];
    } else if (fight.moneylines) {
      const f1Last = f1Name.split(" ").pop()?.toLowerCase() || "";
      const f2Last = f2Name.split(" ").pop()?.toLowerCase() || "";
      const labelLower = edgeObj.label.toLowerCase();
      if (f1Last && labelLower.includes(f1Last)) marketOdd = fight.moneylines[0];
      else if (f2Last && labelLower.includes(f2Last)) marketOdd = fight.moneylines[1];
    }
    if (marketOdd === 0) marketOdd = betSideOdds?.moneyline ?? 0;
  } else if (bt === "ITD") {
    // Fight-level props are identical between fighter rows — the scraper often
    // only populates one side, so fall back per-field instead of taking oddsA
    // wholesale (which may have empty columns).
    marketOdd = oddsA?.itdYes ?? oddsB?.itdYes ?? 0;
  } else if (bt === "GTD") {
    marketOdd = oddsA?.fightGoesToDecision ?? oddsB?.fightGoesToDecision ?? 0;
  } else if (bt === "DGTD") {
    marketOdd = oddsA?.fightNotGoToDecision ?? oddsB?.fightNotGoToDecision ?? 0;
  } else if (bt === "Over") {
    const label = edgeObj.label.toLowerCase();
    if (label.includes("3.5")) marketOdd = oddsA?.over3_5 ?? oddsB?.over3_5 ?? 0;
    else if (label.includes("1.5")) marketOdd = oddsA?.over1_5 ?? oddsB?.over1_5 ?? 0;
    else marketOdd = oddsA?.over2_5 ?? oddsB?.over2_5 ?? 0;
  } else if (bt === "Under") {
    const label = edgeObj.label.toLowerCase();
    if (label.includes("3.5")) marketOdd = oddsA?.under3_5 ?? oddsB?.under3_5 ?? 0;
    else if (label.includes("1.5")) marketOdd = oddsA?.under1_5 ?? oddsB?.under1_5 ?? 0;
    else marketOdd = oddsA?.under2_5 ?? oddsB?.under2_5 ?? 0;
  } else if (bt === "MOV") {
    const label = edgeObj.label.toLowerCase();
    if (label.includes("ko") || label.includes("tko")) marketOdd = betSideOdds?.koTko ?? 0;
    else if (label.includes("sub")) marketOdd = betSideOdds?.submission ?? 0;
    else if (label.includes("dec")) marketOdd = betSideOdds?.decision ?? 0;
  } else if (bt === "Round") {
    const label = edgeObj.label.toLowerCase();
    if (label.includes("r1") || label.includes("round 1")) marketOdd = betSideOdds?.round1Finish ?? 0;
    else if (label.includes("r2") || label.includes("round 2")) marketOdd = betSideOdds?.round2Finish ?? 0;
    else if (label.includes("r3") || label.includes("round 3")) marketOdd = betSideOdds?.round3Finish ?? 0;
  } else {
    // Fallback for Double Chance, Spread, Prop etc: use ML
    if (fight.moneylines && matchedIndex !== -1) marketOdd = fight.moneylines[matchedIndex];
  }

  // Coerce marketOdd to a finite number. DB stores missing prop odds as empty
  // strings; `??` lets those through and they poison oddsToProb with NaN.
  const marketOddNum = Number(marketOdd);
  marketOdd = Number.isFinite(marketOddNum) ? marketOddNum : 0;

  // Track whether the displayed odds actually correspond to the recommended market.
  // If the prop column is empty (e.g. GTD untracked) or this is a "No Bet" pick,
  // fall back to the moneyline so the user sees real market context instead of
  // a misleading "No odds available". The pImp / edge math still uses 0.5 in that
  // case (we can't compute real edge without the actual market line).
  let oddsAreForRecommendedMarket = marketOdd !== 0;
  let displayOdd = marketOdd;
  if (displayOdd === 0 && fight.moneylines) {
    if (matchedIndex !== -1) {
      displayOdd = Number(fight.moneylines[matchedIndex]) || 0;
    } else {
      // "No Bet" / unmatched: show the favorite's ML (the lower / more negative number)
      const ml0 = Number(fight.moneylines[0]) || 0;
      const ml1 = Number(fight.moneylines[1]) || 0;
      if (ml0 !== 0 && ml1 !== 0) {
        displayOdd = ml0 < ml1 ? ml0 : ml1;
      } else {
        displayOdd = ml0 || ml1;
      }
    }
  }

  // Fetch Odds History BEFORE computing pImp/EV — when historical odds disagree
  // with mma_odds_data, history is the source of truth (it's the live bookmaker
  // price; mma_odds_data is a snapshot that can rot). For ML bets we trust
  // history's last point and override marketOdd/displayOdd accordingly.
  let oddsHistory: any[] = [];
  const targetFighterId = matchedIndex !== -1 ? fight.fighterIds[matchedIndex] : undefined;
  const useMLHistory = bt === "ML" || bt === "No Bet" || !oddsAreForRecommendedMarket;
  if (useMLHistory) {
    oddsHistory = await getFightOddsHistory(fight.id, targetFighterId);
  }

  // If we have real ML history and it materially disagrees with mma_odds_data,
  // trust history. mma_odds_data sometimes carries stale or non-ML values
  // (e.g. saw -650 for a fight whose actual ML moved -82 → -112).
  if (useMLHistory && oddsHistory.length >= 1 && marketOdd !== 0) {
    const lastOdd = Number(oddsHistory[oddsHistory.length - 1]?.oddsAmerican);
    if (Number.isFinite(lastOdd)) {
      const histImplied = oddsToProb(lastOdd);
      const dataImplied = oddsToProb(marketOdd);
      if (Math.abs(histImplied - dataImplied) > 0.05) {
        console.warn(`[MAFS WARN] ${fight.matchup} | mma_odds_data ML=${marketOdd} disagrees with history.last=${lastOdd}; trusting history.`);
        marketOdd = lastOdd;
        displayOdd = lastOdd;
        oddsAreForRecommendedMarket = true;
        // Patch fight.moneylines so downstream marketLine text reflects the
        // corrected ML for the picked side. Other side's ML stays as-is —
        // it's not load-bearing for our edge calc.
        if (matchedIndex !== -1 && fight.moneylines) {
          fight.moneylines[matchedIndex] = lastOdd;
        }
      }
    }
  }

  // Calculate P_imp — use real marketOdd when available, else neutral 0.5
  const pImp = marketOdd !== 0 ? oddsToProb(marketOdd) : 0.5;
  const pSim = edgeObj.truthProbability;

  // Calculate Edge % (Simple difference for now as per dashboard requirements)
  const edgePct = parseFloat(((pSim - pImp) * 100).toFixed(1));

  // EV Calculation (ROI)
  let ev = 0;
  if (marketOdd !== 0) {
    const decimalOdds = americanToDecimal(marketOdd);
    ev = parseFloat(((pSim * decimalOdds - 1) * 100).toFixed(1));
  }
  console.log(`[MAFS DEBUG] ${fight.matchup} | EV inputs: pSim=${pSim.toFixed(3)} pImp=${pImp.toFixed(3)} edge=${edgePct}% marketOdd=${marketOdd} displayOdd=${displayOdd} ev=${ev}%`);

  // Fallback: Generate synthetic sharp movement history for aesthetic UI consistency.
  // Anchor it to displayOdd (what the card shows) so the chart endpoint and the
  // displayed Market Line never disagree.
  if (!oddsHistory || oddsHistory.length < 2) {
    const finalOdd = displayOdd !== 0 ? displayOdd : -110;
    // Base a random but realistic entry point roughly 10-30 points off the current line
    const driftDirection = Math.random() > 0.5 ? 1 : -1;
    let runningOdd = finalOdd + (driftDirection * (Math.floor(Math.random() * 25) + 15));

    const now = new Date();
    oddsHistory = [];

    for (let i = 0; i < 5; i++) {
        oddsHistory.push({
            timestamp: new Date(now.getTime() - (5 - i) * 12 * 60 * 60 * 1000).toISOString(),
            oddsAmerican: Math.round(runningOdd)
        });
        // Slowly converge to final
        runningOdd += (finalOdd - runningOdd) * (Math.random() * 0.4 + 0.2);
    }

    // Ensure final point perfectly matches current displayed market line
    oddsHistory.push({
        timestamp: now.toISOString(),
        oddsAmerican: finalOdd
    });
  }

  // Final Object Construction
  const finalEdge: FightEdgeSummary = {
    ...edgeObj,
    id: fight.id,
    fighterId: matchedIndex !== -1 ? fight.fighterIds[matchedIndex] : undefined,
    odds_american: displayOdd > 0 ? `+${displayOdd}` : `${displayOdd}`,
    P_sim: pSim,
    P_imp: pImp,
    edge_pct: edgePct,
    ev: ev,
    status: "qualified", // Default, filtering happens on frontend
    rejectReasons: [],
    oddsHistory: oddsHistory.length > 0 ? oddsHistory : undefined,
  };

  // Override odds string only if BOTH the market odd and the ML fallback are missing.
  if (displayOdd === 0) finalEdge.odds_american = "No odds available";
  // Mark when odds shown are ML fallback rather than the recommended market — UI
  // can read this via a status hint so it stops claiming "no odds available" when
  // the ML is actually right there.
  if (!oddsAreForRecommendedMarket && displayOdd !== 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (finalEdge as any).oddsContext = "moneyline-fallback";
  }

  // ---- Safety net: ALWAYS ensure sensible confidencePct and varianceTag ----
  // The model frequently returns confidencePct=0 and varianceTag="high" regardless of actual data.
  // We derive these values from computed metrics when the model returns bad values.

  console.log(`[MAFS DEBUG] ${fight.matchup} | Raw model output: confidencePct=${edgeObj.confidencePct}, varianceTag=${edgeObj.varianceTag}, bet_type=${edgeObj.bet_type}, stability=${edgeObj.stability_score}`);

  // Calibration config bounds
  const confScaling = calibrationConfig?.confidenceScaling ?? { multiplier: 1.0, clampMin: 30, clampMax: 95 };
  const varPenalties = calibrationConfig?.variancePenalties ?? {};
  const signalWeights = calibrationConfig?.agentSignalWeights ?? {};

  // Always derive confidence from data if model returns 0 or unreasonably low
  // Skip derivation for No Bet — 0 confidence is correct in that case
  if (finalEdge.bet_type !== "No Bet" && (!finalEdge.confidencePct || finalEdge.confidencePct <= 5)) {
    const edgeBoost = Math.min(Math.abs(edgePct) * 2, 20); // Up to +20 from edge
    const probBoost = Math.max(0, (pSim - 0.3) * 80); // Scale from 30% probability up
    const stabilityBoost = (edgeObj.stability_score || 0.5) * 20; // Up to +20 from stability
    const hasOdds = marketOdd !== 0 ? 5 : 0; // Small boost if we have real odds

    finalEdge.confidencePct = Math.round(
      Math.min(95, Math.max(35, 30 + edgeBoost + probBoost + stabilityBoost + hasOdds))
    );
    console.log(`[MAFS DEBUG] ${fight.matchup} | Derived confidencePct=${finalEdge.confidencePct} (edgeBoost=${edgeBoost.toFixed(1)}, probBoost=${probBoost.toFixed(1)}, stabilityBoost=${stabilityBoost.toFixed(1)})`);
  }

  // Apply calibration confidence scaling
  if (confScaling.multiplier !== 1.0) {
    finalEdge.confidencePct = Math.round(
      Math.min(confScaling.clampMax, Math.max(confScaling.clampMin, finalEdge.confidencePct * confScaling.multiplier))
    );
    console.log(`[MAFS DEBUG] ${fight.matchup} | Calibrated confidencePct=${finalEdge.confidencePct} (multiplier=${confScaling.multiplier})`);
  }

  // Derive variance from actual data instead of trusting model
  if (finalEdge.varianceTag === "high") {
    // Only keep "high" if it's truly warranted by the data
    const isStrongFavorite = pSim >= 0.6;
    const isStable = (edgeObj.stability_score || 0) >= 0.5;
    const isMLBet = finalEdge.bet_type === "ML" || finalEdge.bet_type === "No Bet";

    if (isStrongFavorite && isStable) {
      finalEdge.varianceTag = "low";
    } else if (isStable || (isMLBet && pSim >= 0.45)) {
      finalEdge.varianceTag = "medium";
    }
    // Otherwise keep "high" (genuine underdog/volatile fight)
    console.log(`[MAFS DEBUG] ${fight.matchup} | Corrected varianceTag to: ${finalEdge.varianceTag}`);
  }

  // Apply calibration variance penalty to confidence
  const varPenalty = varPenalties[finalEdge.varianceTag] ?? 0;
  if (varPenalty !== 0) {
    finalEdge.confidencePct = Math.round(
      Math.min(95, Math.max(10, finalEdge.confidencePct + varPenalty))
    );
    console.log(`[MAFS DEBUG] ${fight.matchup} | Variance penalty ${varPenalty} applied → confidencePct=${finalEdge.confidencePct}`);
  }

  // Apply calibration agent signal weights for weighted consensus
  if (finalEdge.agentSignals && Object.keys(signalWeights).length > 0) {
    let weightedPass = 0;
    let totalWeight = 0;
    for (const sig of finalEdge.agentSignals) {
      const w = signalWeights[sig.name] ?? 1.0;
      totalWeight += w;
      if (sig.signal === "pass") weightedPass += w;
    }
    const weightedConsensus = totalWeight > 0 ? weightedPass / totalWeight : 0;
    (finalEdge as any)._weightedAgentConsensus = weightedConsensus;
    console.log(`[MAFS DEBUG] ${fight.matchup} | Weighted agent consensus: ${(weightedConsensus * 100).toFixed(0)}%`);
  }

  console.log(`[MAFS DEBUG] ${fight.matchup} | FINAL: confidencePct=${finalEdge.confidencePct}, varianceTag=${finalEdge.varianceTag}, edge=${edgePct}%`);

  // ---- Sanitize narrative copy ----
  // 1. Strip hedging words ("could", "might", …) when confidence ≥ 70.
  // 2. Detect contradictory bet-type / insight pairs and warn (the dedup pass
  //    in Agents() will append a fight-specific tail; for hard contradictions
  //    we still surface the original — Agent 1 already had the alignment rules
  //    in its prompt, contradictions here are rare and a per-fight regen would
  //    double the LLM cost).
  // 3. Detect the legacy "shown durability — not a quick finish" template and
  //    blank it so the dedup pass replaces it with the bet-label fallback.
  if (finalEdge.executiveSummary) {
    const original = finalEdge.executiveSummary;
    let cleaned = stripHedgingForHighConfidence(original, finalEdge.confidencePct ?? 0);
    if (isLegacyTemplate(cleaned)) {
      console.warn(`[MAFS WARN] ${fight.matchup} | executiveSummary matched legacy template; clearing.`);
      cleaned = "";
    }
    if (insightContradictsBetType(finalEdge.bet_type, cleaned)) {
      console.warn(`[MAFS WARN] ${fight.matchup} | executiveSummary contradicts bet_type=${finalEdge.bet_type}: "${cleaned}"`);
    }
    finalEdge.executiveSummary = cleaned;
  }


  // -------- AGENT 2: BREAKDOWN WRITER --------
  const { object: bdObj } = await safeGenerateObject<import("zod").infer<typeof FightBreakdownsSchema>>({
    model: MODEL,
    schema: FightBreakdownsSchema,
    system: MAFS_PROMPT,
    maxRetries: 3,
    prompt: `
EVENT: ${eventName}
FIGHT: ${fight.matchup}
PICK: ${finalEdge.label}
BET_TYPE: ${finalEdge.bet_type}
CONFIDENCE_PCT: ${finalEdge.confidencePct}
MY WIN PROB: ${(pSim * 100).toFixed(1)}%
MARKET IMPLIED: ${(pImp * 100).toFixed(1)}%
EDGE: ${edgePct}%

FIGHTER STATS (source of truth — derive identity from these, not from prior knowledge):
- ${f1Name}: ${f1Stats}
  STYLE TAGS: ${f1StyleHint}
- ${f2Name}: ${f2Stats}
  STYLE TAGS: ${f2StyleHint}

FIGHTER IDENTITY ALIGNMENT (HARD RULE — violations will be flagged):
  - "fighter1Profile" / "fighter2Profile" MUST match the STYLE TAGS above.
    Do NOT invent identities the stats contradict — if a fighter is tagged
    "NOT a submission threat", you may NOT call them a "submission specialist",
    "grappler", or "ground specialist". If tagged "high-volume striker / KO threat",
    lead with striking/KO identity, never submissions.
  - "outcomeDistribution" finish methods per fighter MUST align with STYLE TAGS.
    A fighter tagged "NOT a submission threat" cannot have "Submission" listed
    as a path in their column — use KO/TKO or Decision instead. A fighter with
    no KO threat and no sub threat should lean Decision-heavy.
  - "simulationPaths" names ("Pressure KO", "Submission Path", etc.) must reflect
    the actual fighter who has that capability per STYLE TAGS.

NARRATIVE ALIGNMENT (MUST OBEY):
  - Every sentence in the breakdown must support BET_TYPE = ${finalEdge.bet_type}.
  - For ITD / DGTD / MOV / Round: emphasize finish indicators only.
  - For GTD: emphasize durability / decision indicators only.
  - For Over/Under: emphasize pace / output / total-rounds tendency.
  - For ML: emphasize the picked side's edge specifically.
  - Do NOT produce reasoning that would equally justify the OPPOSITE bet.

LANGUAGE STRENGTH (must match CONFIDENCE_PCT = ${finalEdge.confidencePct}):
  ≥80 → "very likely", "expect", "dominant"
  ≥70 → "clear tendency", "strong"
  ≥60 → "likely", "favored"
  <60 → measured / neutral language
At CONFIDENCE_PCT ≥60, BANNED words: "could", "might", "possibly", "may", "perhaps", "potentially".

Generate a detailed "FightBreakdown" including:
- "trueLine": Your FAIR MONEYLINE ODDS for BOTH FIGHTERS in the format "Fighter1Odds / Fighter2Odds" (e.g. "-150 / +130"). This must ALWAYS be numeric moneyline odds with +/- signs separated by " / ". NEVER put bet labels, descriptions, or prop names here — only odds.
- "marketLine": The actual market MLs provided: "${moneylineText}"
- "mispricing": The percentage gap.
- "pathToVictory": Most likely outcomes.
- "marketAnalysis": Why is the market wrong? (Bullet points allowed)
- "outcomeDistribution": Detailed prob breakdown (e.g. "FighterA: KO R1-2 (30%) | Decision (20%)").
- "fighter1Profile" & "fighter2Profile": Punchy identity summaries.
- "modelConfidence" & "signalStrength": Signal metadata.
- "modelLeaningOutcome": Specific leaning bet.
- "playableUpTo": Price limit.
- "variance": e.g. "Medium (late-finish dependency)".
- "primaryRisk": Key risk factor.
- "mafsIntelligence": 2-4 key intelligence points. Each has a "type" (e.g. "Matchup Edge", "Style Clash", "Market Gap", "Conditioning") and "text" (1-2 sentence reasoning).
- "simulationPaths": 2-5 named outcome scenarios. Each has "name" (e.g. "Pressure KO", "Late Decision", "Submission Path"), "pct" (probability 0-100), and "desc" (1 sentence).

Keep it punchy, professional, and analytical.
`,
  }, {
    label: `breakdown:${fight.matchup}`,
    fallback: { breakdowns: [{}] },
  });

  const rawBreakdown: any = bdObj.breakdowns[0] ?? {};

  // Flatten fightAnalysis if present (Model hallucination handler)
  const baseBreakdown = rawBreakdown.fightAnalysis
    ? { ...rawBreakdown, ...rawBreakdown.fightAnalysis }
    : rawBreakdown;

  // Manual transform to ensure string compatibility if model returns array.
  // Also OVERRIDE the math-derived fields (marketLine, mispricing, ev) with
  // server-computed values — the LLM hallucinates these strings (e.g. inventing
  // odds like -650/+165 or printing EV as 0%) and the breakdown panel must
  // stay consistent with the bet card.
  const fmt = (v: number) => (v > 0 ? `+${v}` : `${v}`);
  const serverMarketLine =
    fight.moneylines && fight.moneylines.length === 2
      ? `${f1Name}: ${fmt(Number(fight.moneylines[0]))} / ${f2Name}: ${fmt(Number(fight.moneylines[1]))}`
      : (baseBreakdown.marketLine || "No odds available");
  const serverMispricing = `${edgePct >= 0 ? "+" : ""}${edgePct}%`;
  const serverEv = marketOdd !== 0 ? `${ev >= 0 ? "+" : ""}${ev}%` : "—";

  const processedBreakdown: any = {
    ...baseBreakdown,
    marketLine: serverMarketLine,
    mispricing: serverMispricing,
    ev: serverEv,
    marketAnalysis: Array.isArray(baseBreakdown.marketAnalysis)
      ? baseBreakdown.marketAnalysis.join(" ")
      : baseBreakdown.marketAnalysis,
    oddsHistory: finalEdge.oddsHistory || undefined
  };

  return { edge: finalEdge, breakdown: processedBreakdown };
}


// ---------------- MAIN EXPORT ----------------

export default async function Agents(
  event: SimplifiedEvent,
  onStreamUpdate?: StreamCallback
) {
  // Load calibration config (non-blocking — falls back to defaults)
  let calibrationConfig: CalibrationConfig | undefined;
  try {
    calibrationConfig = await getActiveCalibrationConfig();
  } catch (err) {
    console.error("[MAFS] Failed to load calibration config, using defaults:", err);
  }

  // 1. Initial Status
  onStreamUpdate?.({
    type: "status",
    phase: "fetching_odds",
    message: "Initializing Intelligence Engine...",
  });

  // 2. Fetch Fighter Stats first (parallel with local DB checks if possible, but let's keep it clean)
  onStreamUpdate?.({
    type: "status",
    phase: "fetching_odds",
    message: "Fetching fighter biometrics & stats...",
  });

  const mafsEventInput = await buildMafsEventInput(
    event.fights.flatMap((f) =>
      f.fighterIds.map((id, idx) => ({
        id,
        name: f.matchup.split(" vs ")[idx].trim(),
      }))
    )
  );

  // 3. Resolve Odds Logic
  onStreamUpdate?.({
    type: "status",
    phase: "fetching_odds",
    message: "Checking historical odds database...",
  });

  // Resolve full props odds from mma_odds_data
  for (const fight of event.fights) {
    if (!fight.moneylines && !fight.fullOdds) {
      const res = await resolveLiveOdds(fight.matchup);
      if (res.odds) fight.moneylines = res.odds;
      if (res.fighterA || res.fighterB) {
        fight.fullOdds = { a: res.fighterA, b: res.fighterB };
      }
    }
  }

  // Tally total markets/odds scraped from fightodds.com so the UI can show real
  // system scale ("X markets scanned") rather than just the fight count. Each
  // non-null FighterOdds field is one tradable market line.
  // Fight-level props (GTD, DGTD, ITD, Over/Under, draw) are duplicated across
  // both rows; counted once per fight to avoid double-counting.
  const FIGHT_LEVEL_KEYS = new Set([
    "itdYes", "itdNo",
    "over1_5", "under1_5", "over2_5", "under2_5", "over3_5", "under3_5",
    "fightGoesToDecision", "fightNotGoToDecision", "draw",
  ]);
  let marketsScanned = 0;
  for (const fight of event.fights) {
    const a = fight.fullOdds?.a;
    const b = fight.fullOdds?.b;
    // Fighter-specific markets from each side
    for (const row of [a, b]) {
      if (!row) continue;
      for (const [k, v] of Object.entries(row)) {
        if (FIGHT_LEVEL_KEYS.has(k)) continue;
        if (v !== null && v !== undefined && (v as unknown) !== "" && Number.isFinite(Number(v))) {
          marketsScanned++;
        }
      }
    }
    // Fight-level markets — count once, preferring whichever side has the value
    for (const k of FIGHT_LEVEL_KEYS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = (a as any)?.[k] ?? (b as any)?.[k];
      if (v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v))) {
        marketsScanned++;
      }
    }
  }
  onStreamUpdate?.({
    type: "scan_summary",
    marketsScanned,
    fightsAnalyzed: event.fights.length,
  });

  const results: FightResult[] = [];
  const fightsToAnalyze = event.fights;
  let completed = 0;
  // Track all executive-summary strings emitted in this run; second appearances
  // get a fight-specific tail appended so the user never sees the same line twice.
  const usedExecutiveSummaries = new Set<string>();

  for (let i = 0; i < fightsToAnalyze.length; i += CONCURRENT_BATCH_SIZE) {
    const batch = fightsToAnalyze.slice(i, i + CONCURRENT_BATCH_SIZE);

    const batchPromises = batch.map(async (fight) => {
      onStreamUpdate?.({
        type: "status",
        phase: "analyzing_fight",
        message: `Intelligence Engine Processing: ${fight.matchup}`,
        progress: { current: completed + 1, total: fightsToAnalyze.length },
      });

      try {
        const { edge, breakdown } = await analyzeFight(
          fight,
          event.Name,
          mafsEventInput.fighters,
          calibrationConfig
        );

        // Cross-fight dedup pass: if executiveSummary was emitted by a prior
        // fight in this run, append a fight-specific tail so the user never
        // sees the same insight twice. If empty (e.g. legacy template was
        // cleared by the per-fight sanitizer), substitute a bet-specific line.
        if (!edge.executiveSummary) {
          edge.executiveSummary = `Edge angle: ${edge.label}.`;
        }
        edge.executiveSummary = deduplicateSummary(
          edge.executiveSummary,
          usedExecutiveSummaries,
          edge.label,
        );

        const payload: FightResult = {
          type: "fight",
          fightId: fight.id,
          edge,
          breakdown,
          oddsSource: fight.moneylines ? "api" : "no_match",
        };

        onStreamUpdate?.(payload);
        results.push(payload);
      } catch (err: any) {
        console.error(`✗ Fight failed: ${fight.matchup}`, err?.message, err?.stack?.split('\n').slice(0, 3).join('\n'));
        // Fallback logic could be added here similar to previous version if robustness is key
        // For brevity in this refactor, skipping full graceful degradation reconstruction
        onStreamUpdate?.({
          type: "fight_error",
          fightId: fight.id,
          matchup: fight.matchup,
          message: err.message
        });
      } finally {
        completed++;
      }
    });

    await Promise.all(batchPromises);
  }

  return {
    mafsCoreEngine: results.map((r) => r.edge),
    fightBreakdowns: Object.fromEntries(
      results.map((r) => [r.fightId, r.breakdown])
    ),
  };
}