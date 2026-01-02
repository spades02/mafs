import { FightBreakdownsSchema } from "@/lib/agents/schemas/fight-breakdown-schema";
import { MAFS_PROMPT } from "@/lib/agents/prompts";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { FightEdgeSummary, FightEdgeSummaryArraySchema } from "@/lib/agents/schemas/fight-edge-summary-schema";
import { FightBreakdownType } from "@/types/fight-breakdowns";

type SimplifiedFight = {
  id: number;
  matchup: string;
  moneylines: number[];
};

type SimplifiedEvent = {
  EventId: string;
  Name: string;
  fights: SimplifiedFight[];
};

export type FightResult = {
  type: 'fight';
  fightId: number;
  edge: FightEdgeSummary;
  breakdown: FightBreakdownType;
};

type StreamCallback = (result: FightResult) => void;

/* ---------------------------------------------
   PHASE 1: CARD-WIDE OVERVIEW (Using generateText)
--------------------------------------------- */
async function analyzeCardOverview(event: SimplifiedEvent): Promise<string> {
  const cardPrompt = `
Analyze this complete UFC card holistically.

Event: ${event.Name}

ALL FIGHTS ON THIS CARD:
${event.fights.map((f, i) => `
Fight ${i + 1} (ID: ${f.id}):
${f.matchup}
Moneylines: ${f.moneylines.join(" / ")}
`).join('\n')}

Provide a comprehensive card analysis covering:

1. COMPETITIVE LANDSCAPE
   - Which fights are closest/most competitive?
   - Which have clear favorites?
   - Which have upset potential?

2. MARKET INEFFICIENCY ZONES
   - Where are lines potentially mispriced?
   - Which matchups have stylistic mismatches the market might miss?
   - Are there patterns in how this card is priced?

3. RELATIVE FIGHT QUALITY (CRITICAL)
   - Rank these ${event.fights.length} fights by edge potential (best to worst)
   - Which fights offer the clearest betting value?
   - Which should likely be avoided or passed on?
   - For each fight, estimate if it's HIGH edge, MEDIUM edge, LOW edge, or PASS

4. KEY FACTORS AFFECTING MULTIPLE FIGHTS
   - Card position effects (early prelims vs main card)
   - Weight class patterns
   - Any regional biases in the odds

Be specific. Reference actual fighters and odds. Provide clear rankings.
This context will inform individual fight analysis - be detailed and actionable.
`;

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    temperature: 0.3,
    maxOutputTokens: 2000, // Increased for comprehensive analysis
    prompt: cardPrompt,
  });

  return text;
}

/* ---------------------------------------------
   PHASE 2: INDIVIDUAL FIGHT WITH CARD CONTEXT
--------------------------------------------- */
async function analyzeFightEdge(
  fight: SimplifiedFight,
  eventName: string,
  cardContext: string,
  fightIndex: number,
  totalFights: number
) {
  // Shorten context if too long to prevent token overflow
  const contextPreview = cardContext.length > 1500 
    ? cardContext.substring(0, 1500) + "\n\n[Context truncated for token efficiency]"
    : cardContext;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    temperature: 0.5,
    schema: FightEdgeSummaryArraySchema,
    maxOutputTokens: 1500, // Increased from 900
    system: MAFS_PROMPT,
    prompt: `
═══════════════════════════════════════════════════════════════
CARD-WIDE CONTEXT (CRITICAL - READ THIS FIRST):
═══════════════════════════════════════════════════════════════

${contextPreview}

═══════════════════════════════════════════════════════════════
NOW ANALYZE THIS SPECIFIC FIGHT:
═══════════════════════════════════════════════════════════════

Event: ${eventName}
Fight ${fightIndex + 1} of ${totalFights}

Matchup: ${fight.matchup}
Moneylines: ${fight.moneylines.join(" / ")}

CRITICAL REQUIREMENTS:
1. Reference the card context above - where does THIS fight rank in edge potential?
2. If context says "high edge potential", your EV should be 15%+ 
3. If context says "avoid" or "low edge", your EV should be under 8%
4. Your confidence MUST be uniquely calculated for THIS matchup
5. DO NOT default to 75% confidence - derive it mechanically
6. This is fight #${fightIndex + 1} - it should have DIFFERENT numbers than other fights

ANTI-PATTERN ALERT:
If you find yourself assigning:
- 75% confidence
- 12.5% or 15% EV
- Tier C
...you are NOT thinking. Recalculate based on THIS specific fight's characteristics.

Return JSON with:
{
  fights: [ 
    { 
      ...ONE fight analysis with UNIQUE confidence/EV derived from matchup specifics... 
    } 
  ]
}
`,
  });

  if (!object?.fights?.[0]) {
    throw new Error("No fight returned from edge agent");
  }
  return object.fights[0];
}

async function analyzeFightBreakdown(
  fight: SimplifiedFight,
  eventName: string,
  cardContext: string,
  edgeSummary: FightEdgeSummary
) {
  // Use shorter context for breakdown to save tokens
  const shortContext = cardContext.length > 500 
    ? cardContext.substring(0, 500) + "..."
    : cardContext;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    temperature: 0.3,
    schema: FightBreakdownsSchema,
    maxOutputTokens: 1200, // Increased from 700
    system: MAFS_PROMPT,
    prompt: `
CARD CONTEXT (Summary):
${shortContext}

EDGE ANALYSIS FOR THIS FIGHT (MUST JUSTIFY THESE NUMBERS):
Bet: ${edgeSummary.bet}
EV: ${edgeSummary.ev}%
Confidence: ${edgeSummary.confidence}%
Tier: ${edgeSummary.tier}

Event: ${eventName}

BREAK DOWN THIS SPECIFIC FIGHT:
${fight.matchup}
Moneylines: ${fight.moneylines.join(" / ")}

Your breakdown must EXPLAIN and JUSTIFY the confidence/EV from the edge analysis above.
Show WHY this fight has ${edgeSummary.ev}% EV and ${edgeSummary.confidence}% confidence.
Reference specific skills, stats, and matchup factors.

CRITICAL: Return ONLY valid JSON. The "breakdowns" field must be an array.

Return JSON with:
{
  breakdowns: [ { ...ONE breakdown object with all required fields... } ]
}

Rules:
- Keep id as: ${fight.id}
- breakdowns MUST be a JSON array (not a string)
- score is REQUIRED (number between 0-100)
- All required fields must be present
- Output valid JSON ONLY
`,
  });

  if (!object?.breakdowns?.[0]) {
    throw new Error("No breakdown returned from breakdown agent");
  }

  return object.breakdowns[0];
}

/* ---------------------------------------------
   MAIN ORCHESTRATOR
--------------------------------------------- */
async function Agents(
  event: SimplifiedEvent,
  onFightComplete?: StreamCallback
): Promise<{ mafsCoreEngine: FightEdgeSummary[]; fightBreakdowns: FightBreakdownType[] }> {
  
  // PHASE 1: Analyze entire card first
  console.log("Phase 1: Analyzing card holistically...");
  const cardContext = await analyzeCardOverview(event);
  console.log("Card analysis complete. Context length:", cardContext.length);
  console.log("Preview:", cardContext.substring(0, 300) + "...\n");

  const mafsCoreEngine: FightEdgeSummary[] = [];
  const fightBreakdowns: FightBreakdownType[] = [];

  // PHASE 2: Analyze each fight with card context
  console.log(`\nPhase 2: Analyzing ${event.fights.length} fights with card context...\n`);
  
  for (let i = 0; i < event.fights.length; i++) {
    const fight = event.fights[i];
    
    try {
      console.log(`[${i + 1}/${event.fights.length}] Analyzing: ${fight.matchup}...`);
      
      // First get edge analysis with card context
      const edge = await analyzeFightEdge(
        fight, 
        event.Name, 
        cardContext,
        i,
        event.fights.length
      );

      // Then get breakdown that references the edge
      const breakdown = await analyzeFightBreakdown(
        fight,
        event.Name,
        cardContext,
        edge
      );

      // CRITICAL: Only push to arrays if BOTH succeeded
      mafsCoreEngine.push(edge);
      fightBreakdowns.push(breakdown);

      // Stream this fight's result immediately
      if (onFightComplete) {
        onFightComplete({
          type: 'fight',
          fightId: fight.id,
          edge,
          breakdown,
        });
      }

      console.log(`✓ Fight ${i + 1} complete: ${edge.bet} | EV: ${edge.ev}% | Confidence: ${edge.confidence}% | Tier: ${edge.tier}`);
      
    } catch (err: any) {
      console.error(`✗ Fight ${i + 1} analysis failed:`, fight.matchup);
      console.error(`  Error: ${err.message || err}`);
      
      // Don't push anything to arrays - skip this fight entirely
      // This keeps mafsCoreEngine and fightBreakdowns in sync
    }
  }

  // Log summary
  console.log("\n═══════════════════════════════════════");
  console.log("ANALYSIS COMPLETE - SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`Successfully analyzed: ${mafsCoreEngine.length}/${event.fights.length} fights`);
  console.log("Confidence spread:", mafsCoreEngine.map(e => `${e.confidence}%`).join(", "));
  console.log("EV spread:", mafsCoreEngine.map(e => `${e.ev}%`).join(", "));
  console.log("Tier distribution:", mafsCoreEngine.map(e => e.tier).join(", "));
  console.log("═══════════════════════════════════════\n");

  return {
    mafsCoreEngine,
    fightBreakdowns,
  };
}

export default Agents;