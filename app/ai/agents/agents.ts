// agents.ts:
import { FightBreakdownsSchema } from "@/lib/agents/schemas/fight-breakdown-schema";
import { MAFS_PROMPT } from "@/lib/agents/prompts";
import { generateObject, generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { FightEdgeSummary, FightEdgeSummaryArraySchema } from "@/lib/agents/schemas/fight-edge-summary-schema";
import { FightBreakdownType } from "@/types/fight-breakdowns";
import { z } from "zod";

// --- TYPES ---

type SimplifiedFight = {
  id: number;
  matchup: string;
  moneylines?: number[] | null; 
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
   TOOLS & SCHEMAS
--------------------------------------------- */

// FIX 1: Explicit Named Schema with format descriptions
const OddsResultSchema = z.object({
  fighterA_odds: z.number().int().nullable().describe("American Moneyline Odd (e.g. -150, +200). MUST be an integer. No decimals (1.5)."),
  fighterB_odds: z.number().int().nullable().describe("American Moneyline Odd (e.g. -150, +200). MUST be an integer. No decimals (1.5)."),
  found: z.boolean().describe("True if valid live odds were found, false otherwise."),
});

const searchParamsSchema = z.object({
  query: z.string().describe('The fighter names to search for (e.g., "Makhachev vs Volkanovski")'),
});

type SearchArgs = z.infer<typeof searchParamsSchema>;

const webSearchTool = tool({
  description: 'Fetch live odds from The Odds API for a specific fight',
  inputSchema: searchParamsSchema,
  
  execute: async (rawArgs: any) => {
    // FIX 2: Defensive checks
    if (!rawArgs || typeof rawArgs !== 'object') {
      return "Error: No arguments provided to tool.";
    }

    const args = rawArgs as SearchArgs; 
    const { query } = args;
    
    // Allow empty query if handled upstream, but warn
    if (!query) return "Error: Query argument is missing.";

    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) return "Error: ODDS_API_KEY is not set.";

    try {
      // 1. Fetch ALL active MMA odds in AMERICAN format
      const url = `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;
      const response = await fetch(url, { method: "GET" });
      const events = await response.json();

      if (!Array.isArray(events)) return `API Error: ${JSON.stringify(events)}`;

      // 2. SMART FILTERING LOGIC
      const ignoredTerms = ['ufc', 'mma', 'odds', 'vs', 'vs.', 'fight', 'bout', 'championship', '324', '325', '2025', '2026', 'night', 'fight night'];
      
      const searchTerms = query.toLowerCase()
        .split(' ')
        .map(t => t.replace(/[^a-z0-9]/g, '')) 
        .filter(t => t.length > 2 && !ignoredTerms.includes(t)); 

      console.log(`🔎 Filter Terms: [${searchTerms.join(', ')}]`);

      let bestMatch = null;
      let highestScore = 0;

      for (const event of events) {
        const eventName = (event.home_team + " " + event.away_team).toLowerCase();
        let score = 0;
        searchTerms.forEach(term => { if (eventName.includes(term)) score++; });

        if (score > 0 && score > highestScore) {
          highestScore = score;
          bestMatch = event;
        }
      }

      if (!bestMatch) return `No matching event found for "${query}".`;

      console.log(`   ✓ Matched: "${bestMatch.home_team} vs ${bestMatch.away_team}" (Score: ${highestScore})`);

      // 3. Format Data
      const bookmakers = bestMatch.bookmakers.map((bookie: any) => {
        const market = bookie.markets.find((m: any) => m.key === 'h2h');
        if (!market) return null;
        
        // Output format: "DraftKings: [FighterA -150, FighterB +130]"
        const outcomes = market.outcomes.map((o: any) => `${o.name} ${o.price}`).join(', ');
        return `${bookie.title}: [${outcomes}]`;
      }).filter(Boolean);

      if (bookmakers.length === 0) return `Found event but no H2H odds listed.`;

      return `Found Live Odds (American Format): ${bookmakers.slice(0, 5).join('\n')}`;

    } catch (error: any) {
      console.error("Odds API Error:", error);
      return `Failed to fetch odds: ${error.message}`;
    }
  },
});

/* ---------------------------------------------
   PHASE 0: LIVE ODDS RESOLUTION (Manual Execution)
--------------------------------------------- */
async function resolveLiveOdds(fight: SimplifiedFight, eventName: string): Promise<number[]> {
  console.log(`  Targeting live odds for: ${fight.matchup}...`);
  const cleanEventName = eventName.includes(':') ? eventName.split(':')[0] : eventName;

  // Split names for explicit mapping
  const [fighterA, fighterB] = fight.matchup.split(/ vs\.? /i);

  try {
    const { toolCalls } = await generateText({
      model: openai("gpt-4o"),
      tools: { webSearch: webSearchTool },
      maxRetries: 3, 
      system: "You are a betting data assistant. Call the webSearch tool.",
      prompt: `Find moneyline odds for: ${fight.matchup} (Event: ${cleanEventName})`,
    });

    let searchData = "No search performed.";

    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      let args = (call as any).args;

      // FIX 3: FALLBACK for lazy LLM
      if (!args || !args.query) {
        console.warn(`   ⚠ Empty args detected. Injecting default query.`);
        args = { query: `${fight.matchup} ${cleanEventName}` };
      }
      
      // Execute manually
      searchData = await (webSearchTool as any).execute(args);
    } else {
      console.warn("   ⚠ Agent did not request a search.");
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"), 
      schema: OddsResultSchema,
      prompt: `
        The tool returned this data: "${searchData}"
        
        TASK: Extract American Moneyline odds.
        Fighter A: "${fighterA}"
        Fighter B: "${fighterB}"
        
        CRITICAL RULES:
        1. STRICTLY map the price to the correct name.
        2. Format MUST be American (e.g. -200, +150). 
        3. Do NOT use Decimal odds (e.g. 1.50). 
        4. If text says "${fighterB} -200", then fighterB_odds = -200.
        5. If no valid odds found, set found=false.
      `,
    });

    if (object.found && object.fighterA_odds !== null && object.fighterB_odds !== null) {
      console.log(`  ✓ Resolved: ${object.fighterA_odds} / ${object.fighterB_odds}`);
      return [object.fighterA_odds, object.fighterB_odds];
    }
    
    console.log(`  ⚠ No valid odds extracted.`);

  } catch (error: any) {
    console.warn(`  ✗ Resolution failed for ${fight.matchup}:`, error.message);
  }

  return [];
}

/* ---------------------------------------------
   PHASE 1: CARD OVERVIEW
--------------------------------------------- */
async function analyzeCardOverview(event: SimplifiedEvent): Promise<string> {
  const validFights = event.fights.filter(f => f.moneylines && f.moneylines.length === 2);

  const cardPrompt = `
Analyze this complete UFC card holistically.
Event: ${event.Name}

ALL FIGHTS ON THIS CARD (Odds sourced from Live Tools):
${validFights.map((f, i) => `
Fight ${i + 1} (ID: ${f.id}):
${f.matchup}
Moneylines: ${f.moneylines ? f.moneylines.join(" / ") : "N/A"}
`).join('\n')}

Provide a comprehensive card analysis covering:
1. COMPETITIVE LANDSCAPE
2. MARKET INEFFICIENCY ZONES
3. RELATIVE FIGHT QUALITY (CRITICAL)
4. KEY FACTORS AFFECTING MULTIPLE FIGHTS
`;

  const { text } = await generateText({
    model: openai("gpt-4o"),
    maxOutputTokens: 2000, 
    prompt: cardPrompt,
  });

  return text;
}

/* ---------------------------------------------
   PHASE 2: INDIVIDUAL FIGHT ANALYSIS
--------------------------------------------- */
async function analyzeFightEdge(
  fight: SimplifiedFight,
  eventName: string,
  cardContext: string,
  fightIndex: number,
  totalFights: number
) {
  const contextPreview = cardContext.length > 1500 ? cardContext.substring(0, 1500) + "..." : cardContext;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: FightEdgeSummaryArraySchema,
    maxOutputTokens: 1500,
    maxRetries: 3, 
    system: MAFS_PROMPT,
    prompt: `
CARD CONTEXT:
${contextPreview}

ANALYZE THIS FIGHT:
Event: ${eventName}
Fight ${fightIndex + 1} of ${totalFights}
Matchup: ${fight.matchup}
Moneylines: ${fight.moneylines!.join(" / ")} 

CRITICAL REQUIREMENTS:
1. Reference the card context above.
2. If context says "high edge", EV should be 15%+.
3. If context says "avoid", EV should be under 8%.
4. Derive confidence purely from this matchup mechanics.
5. JSON ONLY: Numbers must be numbers (e.g. 15, not "15%").

Return JSON with:
{ fights: [ { ...ONE fight analysis... } ] }
`,
  });

  if (!object?.fights?.[0]) throw new Error("No fight returned from edge agent");
  return object.fights[0];
}

async function analyzeFightBreakdown(
  fight: SimplifiedFight,
  eventName: string,
  cardContext: string,
  edgeSummary: FightEdgeSummary
) {
  const shortContext = cardContext.length > 500 ? cardContext.substring(0, 500) + "..." : cardContext;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: FightBreakdownsSchema,
    maxOutputTokens: 1200,
    maxRetries: 3,
    system: MAFS_PROMPT,
    prompt: `
CARD CONTEXT: ${shortContext}

EDGE ANALYSIS:
Bet: ${edgeSummary.bet} | EV: ${edgeSummary.ev}% | Confidence: ${edgeSummary.confidence}%

BREAK DOWN:
${fight.matchup}
Moneylines: ${fight.moneylines!.join(" / ")}

Explain the edge. Justify the EV and confidence.
JSON Rules: 
- "score" must be a number (0-100).
- "prediction" is a string.

Return JSON with:
{ breakdowns: [ { ...ONE breakdown... } ] }
`,
  });

  if (!object?.breakdowns?.[0]) throw new Error("No breakdown returned");
  return object.breakdowns[0];
}

/* ---------------------------------------------
   MAIN ORCHESTRATOR
--------------------------------------------- */
async function Agents(
  event: SimplifiedEvent,
  onFightComplete?: StreamCallback
): Promise<{ mafsCoreEngine: FightEdgeSummary[]; fightBreakdowns: FightBreakdownType[] }> {
  
  // PHASE 0: STRICT TOOLS MODE
  console.log("Phase 0: Fetching live odds via Tools (Strict Mode)...");
  
  for (let i = 0; i < event.fights.length; i++) {
    const fight = event.fights[i];
    const liveOdds = await resolveLiveOdds(fight, event.Name);
    event.fights[i].moneylines = liveOdds.length === 2 ? liveOdds : null;
  }

  // PHASE 1: Analyze Card
  console.log("\nPhase 1: Analyzing card holistically...");
  const cardContext = await analyzeCardOverview(event);
  
  const mafsCoreEngine: FightEdgeSummary[] = [];
  const fightBreakdowns: FightBreakdownType[] = [];

  // PHASE 2: Individual Analysis
  console.log(`\nPhase 2: Analyzing fights...`);
  
  for (let i = 0; i < event.fights.length; i++) {
    const fight = event.fights[i];
    
    if (!fight.moneylines || fight.moneylines.length !== 2) {
      console.warn(`[Skipping] Fight ${fight.matchup} - Tool could not resolve live odds.`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${event.fights.length}] Analyzing: ${fight.matchup}...`);
      
      const edge = await analyzeFightEdge(fight, event.Name, cardContext, i, event.fights.length);
      const breakdown = await analyzeFightBreakdown(fight, event.Name, cardContext, edge);

      mafsCoreEngine.push(edge);
      fightBreakdowns.push(breakdown);

      if (onFightComplete) {
        onFightComplete({ type: 'fight', fightId: fight.id, edge, breakdown });
      }

      console.log(`✓ Fight ${i + 1} complete.`);
      
    } catch (err: any) {
      console.error(`✗ Fight ${i + 1} failed:`, err.message);
    }
  }

  return { mafsCoreEngine, fightBreakdowns };
}

export default Agents;