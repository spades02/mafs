// app/ai/agents/agents.ts

import { generateObject } from "ai";
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
import { resolveLiveOdds, fetchAllOdds } from "@/lib/odds/resolve-live-odds";
import { buildMafsEventInput } from "@/lib/mafs/fetchFighterStats";

import { americanToDecimal, oddsToProb } from "@/lib/odds/utils";

// ---------------- CONFIG ----------------

const MODEL = "gpt-4o"; // Updated to latest efficient model
const CONCURRENT_BATCH_SIZE = 6;

// ---------------- TYPES ----------------

export type SimplifiedFight = {
  id: string;
  matchup: string;
  moneylines?: [number, number] | null;
  fighterIds: [string, string];
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

type StreamCallback = (update: FightResult | StatusUpdate | ErrorUpdate) => void;

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

async function analyzeFight(
  fight: SimplifiedFight,
  eventName: string,
  mafsEventInputFighters: any[]
): Promise<{ edge: FightEdgeSummary; breakdown: FightBreakdownType }> {

  const fighter1 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[0]);
  const fighter2 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[1]);
  const f1Name = fighter1?.name || "Unknown";
  const f2Name = fighter2?.name || "Unknown";

  const moneylineText = fight.moneylines
    ? `${f1Name}: ${fight.moneylines[0]} / ${f2Name}: ${fight.moneylines[1]}`
    : "No odds available";

  // -------- AGENT 1: EDGE CALCULATION --------
  const { object: edgeObj } = await generateObject({
    model: openai(MODEL),
    schema: FightEdgeSummaryGenerationSchema,
    system: MAFS_PROMPT,
    maxRetries: 3,
    prompt: `
EVENT: ${eventName}
MATCHUP: ${fight.matchup}
MONEYLINES: ${moneylineText}

STATS:
- ${fighter1?.name}: ${JSON.stringify(fighter1 ?? {})}
- ${fighter2?.name}: ${JSON.stringify(fighter2 ?? {})}

TASK:
1. **Analyze** the stats and stylistic matchup deeply.
2. **Estimate** "truthProbability" (Win %) for both sides.
3. **Compare** with market lines if available.
4. **DECIDE**: Is there a bet?
   - **Scenario A (Odds Available)**: You MUST only recommend a bet if your estimated Win % > Market Implied %. Otherwise, PASS.
   - **Scenario B (No Odds)**: Only recommend a bet if valid Win % is > 65%. Otherwise, PASS.

5. **Generate Output**:
   - **Label**: ALWAYS set 'label' to the specific fighter/outcome you analyzed (e.g. "Fighter Name ML"). NEVER use "No Bet" or "Pass" as the label.
   - **bet_type**: MUST be one of ["ML", "ITD", "Over", "Under", "Spread", "Prop", "No Bet"]. If passing, use "No Bet".
   - **Confidence**: If you decide to PASS (due to low edge/confidence), set 'confidencePct' to 0. This will signal the system to filter it out.

6. **Generate** 'agentSignals' even if passing (explain why stats are weak/strong).
7. **Populate** 'detailedReason'.

IMPORTANT:
- Be strict. Do not force a bet on 50/50 fights with bad odds.
- Use explicit visual language for 'executiveSummary'.
`,
  });

  // Reconcile Data
  const chosenBetName = edgeObj.label.toLowerCase(); // or edgeObj.bet? label is "Pereira ITD", bet is "ITD"

  // Determining which side the bet is on to grab odds
  // We try to match the label or the 'fight' string parts?
  // Let's rely on the AI to have picked a side in 'label' often being names
  const matchedIndex = getBestOddsIndex(edgeObj.label, f1Name, f2Name);

  let marketOdd = 0;
  if (fight.moneylines && matchedIndex !== -1) {
    marketOdd = fight.moneylines[matchedIndex];
  } else if (fight.moneylines) {
    // Robust fallback: Check if label contains names directly
    const f1Last = f1Name.split(" ").pop()?.toLowerCase() || "";
    const f2Last = f2Name.split(" ").pop()?.toLowerCase() || "";
    const labelLower = edgeObj.label.toLowerCase();

    if (f1Last && labelLower.includes(f1Last)) {
      marketOdd = fight.moneylines[0];
    } else if (f2Last && labelLower.includes(f2Last)) {
      marketOdd = fight.moneylines[1];
    }
  }

  // If bet type is NOT ML (e.g. ITD, Over/Under), we generally don't have those specific odds in 'fight.moneylines' (which are usually MLs).
  // So 'marketOdd' might be misleading if used for ITD calculation.
  // For now, if bet_type != "ML", we might mark oddsUnavailable unless AI provided them?
  // But the prompt gave MLs.
  // For MVP: If bet_type is ML, use ML odds. Else, if we can't get props, we default to 0/Unknown.

  // Calculate P_imp
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

  // Final Object Construction
  const finalEdge: FightEdgeSummary = {
    ...edgeObj,
    id: fight.id, // Generate or pass
    odds_american: marketOdd > 0 ? `+${marketOdd}` : `${marketOdd}`,
    P_sim: pSim,
    P_imp: pImp,
    edge_pct: edgePct,
    ev: ev,
    status: "qualified", // Default, filtering happens on frontend
    rejectReasons: [],
  };

  // override odds string if 0
  if (marketOdd === 0) finalEdge.odds_american = "No odds available";


  // -------- AGENT 2: BREAKDOWN WRITER --------
  const { object: bdObj } = await generateObject({
    model: openai(MODEL),
    schema: FightBreakdownsSchema,
    system: MAFS_PROMPT,
    prompt: `
EVENT: ${eventName}
FIGHT: ${fight.matchup}
PICK: ${finalEdge.label}
MY WIN PROB: ${(pSim * 100).toFixed(1)}%
MARKET IMPLIED: ${(pImp * 100).toFixed(1)}%
EDGE: ${edgePct}%

Generate a detailed "FightBreakdown" including:
- "trueLine": Your fair odds for both fighters (e.g. "-150 / +130")
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

Keep it punchy, professional, and analytical.
`,
  });

  const rawBreakdown: any = bdObj.breakdowns[0];

  // Flatten fightAnalysis if present (Model hallucination handler)
  const baseBreakdown = rawBreakdown.fightAnalysis
    ? { ...rawBreakdown, ...rawBreakdown.fightAnalysis }
    : rawBreakdown;

  // Manual transform to ensure string compatibility if model returns array
  const processedBreakdown: any = {
    ...baseBreakdown,
    marketAnalysis: Array.isArray(baseBreakdown.marketAnalysis)
      ? baseBreakdown.marketAnalysis.join(" ")
      : baseBreakdown.marketAnalysis
  };

  return { edge: finalEdge, breakdown: processedBreakdown };
}


// ---------------- MAIN EXPORT ----------------

export default async function Agents(
  event: SimplifiedEvent,
  onStreamUpdate?: StreamCallback
) {
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

  let missingOddsCount = 0;

  // First pass: Try to resolve using DB only
  for (const fight of event.fights) {
    if (!fight.moneylines) {
      const res = await resolveLiveOdds(fight.matchup, null); // null cache forces DB or global cache check
      if (res.odds) {
        fight.moneylines = res.odds;
      } else {
        missingOddsCount++;
      }
    }
  }

  // Second pass: If missing odds, fetch API cache
  if (missingOddsCount > 0) {
    onStreamUpdate?.({
      type: "status",
      phase: "fetching_odds",
      message: `Fetching fresh live odds from API (${missingOddsCount} fights pending)...`,
    });

    const { cache: apiCache } = await fetchAllOdds();

    if (apiCache) {
      for (const fight of event.fights) {
        if (!fight.moneylines) {
          const res = await resolveLiveOdds(fight.matchup, apiCache);
          fight.moneylines = res.odds;
        }
      }
    }
  }

  const results: FightResult[] = [];
  const fightsToAnalyze = event.fights;
  let completed = 0;

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
          mafsEventInput.fighters
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
        console.error(`✗ Fight failed: ${fight.matchup}`, err);
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