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
import { resolveLiveOdds } from "@/lib/odds/resolve-live-odds";
import { whyMafsLikesThis } from "@/lib/agents/schemas/why-mafs-likes-this";
import { buildMafsEventInput } from "@/lib/mafs/fetchFighterStats";

// ---------------- CONFIG ----------------

const MODEL = "gpt-4o";
const CONCURRENT_BATCH_SIZE = 3; // Process 3 fights at a time

// ---------------- TYPES ----------------

type FightEdgeWithId = FightEdgeSummary & {
  id: number;
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

type StreamCallback = (update: FightResult | StatusUpdate) => void;

// ---------------- PHASE 1: CARD OVERVIEW ----------------

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
  // ✅ Correctly find fighters by ID (prevents swapping stats)
  const fighter1 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[0]);
  const fighter2 = mafsEventInputFighters.find((f) => f.id === fight.fighterIds[1]);

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
CARD CONTEXT (QUALITATIVE ONLY):
${cardContext.slice(0, 800)}

EVENT: ${eventName}
MATCHUP: ${fight.matchup}
MONEYLINES: ${moneylineText}

FIGHTER STATS:
- ${fighter1?.name ?? "Unknown"}: ${JSON.stringify(fighter1 ?? {})}
- ${fighter2?.name ?? "Unknown"}: ${JSON.stringify(fighter2 ?? {})}

MAFS RULES:
- You are an ACTION BETTOR.
- "No Bet" is forbidden unless stats are completely identical.
- Even a 1% edge is enough to bet.
- Tiers can only be "S", "A", "B", "C", "S" being the highest.
- Tiers are assigned based on everything combined, i.e., EV, Confidence and bettor intuition.
- If odds are "N/A", estimate the fair line yourself and bet based on that.
- Use the striking and win stats provided to find a narrative.

CRITICAL SCHEMA INSTRUCTION:
- Inside "rationale", put "whyThisLineNotOthers" INSIDE the "sections" object.

Return ONE object only.
`,
  });

  // Normalize rationale to prevent schema crashes
  const normalizedRationale = whyMafsLikesThis.parse(edgeObj.rationale);

  const edgeWithId: FightEdgeWithId = {
    id: fight.id,
    rank: edgeObj.rank || 0,
    fight: edgeObj.fight,
    methodOfVictory: edgeObj.methodOfVictory,
    bet: edgeObj.bet,
    score: edgeObj.score || 0,
    ev: edgeObj.ev || 0,
    truthProbability: edgeObj.truthProbability || 0.5,
    marketProbability: edgeObj.marketProbability || 0.5,
    confidence: edgeObj.confidence || 0,
    risk: edgeObj.risk || 0,
    tier: edgeObj.tier || "No Bet",
    recommendedStake: edgeObj.recommendedStake || 0,
    rationale: normalizedRationale,
  };

  // -------- AGENT 2: BREAKDOWN TEXT --------
  const { object: bdObj } = await generateObject({
    model: openai(MODEL),
    schema: FightBreakdownsSchema,
    system: MAFS_PROMPT,
    maxRetries: 3,
    prompt: `
EVENT: ${eventName}
FIGHT: ${fight.matchup}

EDGE:
Bet: ${edgeWithId.bet}
EV: ${edgeWithId.ev}%
Confidence: ${edgeWithId.confidence}%

FIGHTER STATS:
- ${fighter1?.name}: ${JSON.stringify(fighter1 ?? {})}
- ${fighter2?.name}: ${JSON.stringify(fighter2 ?? {})}

Explain the edge clearly.
`,
  });

  return { edge: edgeWithId, breakdown: bdObj.breakdowns[0] };
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

  // 2. Resolve Live Odds (Optimized)
  const oddsSourceMap = new Map<number, FightResult["oddsSource"]>();
  onStreamUpdate?.({
    type: "status",
    phase: "fetching_odds",
    message: "Resolving live odds",
  });

  for (const fight of event.fights) {
    const res = await resolveLiveOdds(fight.matchup);
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
      } finally {
        completed++;
      }
    });

    await Promise.all(batchPromises);
  }

  // 5. Post-Processing: Sort & Rank
  // Sort by EV (descending) so the best bets are #1
  results.sort((a, b) => b.edge.ev - a.edge.ev);

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