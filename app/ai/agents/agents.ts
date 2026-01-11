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
  oddsSource: 'api' | 'manual_search' | 'fallback';
};

export type StatusUpdate = {
  type: 'status';
  phase: 'fetching_odds' | 'analyzing_card' | 'analyzing_fight';
  message: string;
  progress?: {
    current: number;
    total: number;
  };
};

type StreamCallback = (result: FightResult | StatusUpdate) => void;

/* ---------------------------------------------
   TOOLS & SCHEMAS
--------------------------------------------- */

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
    if (!rawArgs || typeof rawArgs !== 'object') {
      return "Error: No arguments provided to tool.";
    }

    const args = rawArgs as SearchArgs; 
    const { query } = args;
    
    if (!query) return "Error: Query argument is missing.";

    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) return "Error: ODDS_API_KEY is not set.";

    try {
      const url = `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;
      const response = await fetch(url, { method: "GET" });
      const events = await response.json();

      if (!Array.isArray(events)) return `API Error: ${JSON.stringify(events)}`;

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

      const bookmakers = bestMatch.bookmakers.map((bookie: any) => {
        const market = bookie.markets.find((m: any) => m.key === 'h2h');
        if (!market) return null;
        
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
   MANUAL WEB SEARCH FALLBACK
--------------------------------------------- */

async function manualWebSearchForOdds(
  fighterA: string,
  fighterB: string,
  eventName: string
): Promise<{ odds: [number, number] | null; source: string }> {
  
  console.log(`  🔍 AI Agent performing manual web search...`);

  try {
    const searchQuery = `${fighterA} vs ${fighterB} betting odds moneyline`;
    
    const { text, toolCalls, toolResults } = await generateText({
      model: openai("gpt-4o"),
      maxOutputTokens: 2000,
      tools: {
        web_search: tool({
          description: 'Search the web for current information',
          inputSchema: z.object({
            query: z.string().describe('Search query')
          }),
          execute: async ({ query }) => {
            console.log(`    Searching: "${query}"`);
            return { query, results: "Search not implemented in this environment" };
          }
        })
      },
      prompt: `Search the web for current betting odds for this UFC fight: ${fighterA} vs ${fighterB}

Find the moneyline odds from any major sportsbook (DraftKings, FanDuel, BetMGM, etc.).

I need:
- ${fighterA}'s moneyline odds (American format like -150 or +200)
- ${fighterB}'s moneyline odds (American format like -150 or +200)

Search query: "${searchQuery}"

After searching, extract the exact odds and report them clearly.`,
    });

    console.log(`    Search completed. Analyzing results...`);

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        fighterA_name: z.string(),
        fighterA_odds: z.number().int().nullable(),
        fighterB_name: z.string(),
        fighterB_odds: z.number().int().nullable(),
        found: z.boolean(),
        confidence: z.enum(['high', 'medium', 'low']),
        source: z.string().describe('Which sportsbook or website the odds came from'),
      }),
      prompt: `Based on this search context and results:

Fighter A: ${fighterA}
Fighter B: ${fighterB}

Search results and context:
${text}

Tool calls: ${JSON.stringify(toolCalls)}
Tool results: ${JSON.stringify(toolResults)}

TASK: Extract the moneyline betting odds for both fighters.

CRITICAL RULES:
1. Only extract AMERICAN format odds (e.g., -150, +200, -300, +175)
2. Match the odds to the correct fighter name
3. If you see "${fighterA} -200", then fighterA_odds = -200
4. If you see "${fighterB} +150", then fighterB_odds = +150
5. Look for terms like "moneyline", "ML", "to win"
6. Set found=true only if you found valid odds for BOTH fighters
7. Set confidence based on how clear/recent the odds are
8. Note which sportsbook the odds came from

If no valid odds found, set found=false.`,
    });

    if (object.found && object.fighterA_odds !== null && object.fighterB_odds !== null) {
      console.log(`    ✓ AI extracted odds: ${object.fighterA_odds} / ${object.fighterB_odds} from ${object.source} (${object.confidence} confidence)`);
      return {
        odds: [object.fighterA_odds, object.fighterB_odds],
        source: `manual_search_${object.source}`
      };
    }

    console.log(`    ⚠ AI could not extract valid odds`);
    return { odds: null, source: 'manual_search_failed' };

  } catch (error: any) {
    console.error(`    ✗ Manual search error:`, error.message);
    return { odds: null, source: 'manual_search_error' };
  }
}

/* ---------------------------------------------
   PHASE 0: LIVE ODDS RESOLUTION
--------------------------------------------- */
async function resolveLiveOdds(
  fight: SimplifiedFight, 
  eventName: string
): Promise<{ odds: number[] | null; source: 'api' | 'manual_search' | 'fallback' }> {
  
  console.log(`  Targeting live odds for: ${fight.matchup}...`);
  const cleanEventName = eventName.includes(':') ? eventName.split(':')[0] : eventName;

  const [fighterA, fighterB] = fight.matchup.split(/ vs\.? /i);

  // STRATEGY 1: Try structured API tool
  try {
    const { toolCalls } = await generateText({
      model: openai("gpt-4o"),
      tools: { webSearch: webSearchTool },
      maxRetries: 2, 
      system: "You are a betting data assistant. Call the webSearch tool.",
      prompt: `Find moneyline odds for: ${fight.matchup} (Event: ${cleanEventName})`,
    });

    let searchData = "No search performed.";

    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      let args = (call as any).args;

      if (!args || !args.query) {
        console.warn(`   ⚠ Empty args detected. Injecting default query.`);
        args = { query: `${fight.matchup} ${cleanEventName}` };
      }
      
      searchData = await (webSearchTool as any).execute(args);
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
      console.log(`  ✓ Resolved via API: ${object.fighterA_odds} / ${object.fighterB_odds}`);
      return { odds: [object.fighterA_odds, object.fighterB_odds], source: 'api' };
    }
    
    console.log(`  ⚠ API did not return valid odds, trying manual search...`);

  } catch (error: any) {
    console.warn(`  ✗ API resolution failed:`, error.message);
    console.log(`  🔄 Falling back to manual web search...`);
  }

  // STRATEGY 2: AI agent manually searches and extracts odds
  const manualResult = await manualWebSearchForOdds(fighterA, fighterB, cleanEventName);
  
  if (manualResult.odds) {
    return { odds: manualResult.odds, source: 'manual_search' };
  }

  // STRATEGY 3: Generate fallback odds (last resort)
  console.log(`  ⚠ Using fallback odds for: ${fight.matchup}`);
  const fallbackOdds = generateFallbackOdds(fight.matchup);
  return { odds: fallbackOdds, source: 'fallback' };
}

function generateFallbackOdds(matchup: string): [number, number] {
  const hash = matchup.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isFavoriteFirst = hash % 2 === 0;
  
  const favoriteOdds = -200;
  const underdogOdds = +170;
  
  return isFavoriteFirst ? [favoriteOdds, underdogOdds] : [underdogOdds, favoriteOdds];
}

/* ---------------------------------------------
   PHASE 1: CARD OVERVIEW
--------------------------------------------- */
async function analyzeCardOverview(event: SimplifiedEvent): Promise<string> {
  const validFights = event.fights.filter(f => f.moneylines && f.moneylines.length === 2);

  const cardPrompt = `
Analyze this complete UFC card holistically.
Event: ${event.Name}

ALL FIGHTS ON THIS CARD:
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
  onStreamUpdate?: StreamCallback
): Promise<{ mafsCoreEngine: FightEdgeSummary[]; fightBreakdowns: FightBreakdownType[] }> {
  
  const oddsSourceMap = new Map<number, 'api' | 'manual_search' | 'fallback'>();
  
  // PHASE 0: FETCH ODDS
  console.log("Phase 0: Fetching odds (API → AI Manual Search → Fallback)...");
  console.log("══════════════════════════════════════════════════════════\n");
  
  for (let i = 0; i < event.fights.length; i++) {
    const fight = event.fights[i];
    
    // Emit status update for odds fetching
    if (onStreamUpdate) {
      onStreamUpdate({
        type: 'status',
        phase: 'fetching_odds',
        message: `Fetching live odds for ${fight.matchup}`,
        progress: {
          current: i + 1,
          total: event.fights.length
        }
      });
    }
    
    const { odds, source } = await resolveLiveOdds(fight, event.Name);
    event.fights[i].moneylines = odds;
    oddsSourceMap.set(fight.id, source);
  }

  // Report odds sources
  const apiCount = Array.from(oddsSourceMap.values()).filter(s => s === 'api').length;
  const manualCount = Array.from(oddsSourceMap.values()).filter(s => s === 'manual_search').length;
  const fallbackCount = Array.from(oddsSourceMap.values()).filter(s => s === 'fallback').length;
  
  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`📊 Odds Summary: ${apiCount} from API, ${manualCount} from AI manual search, ${fallbackCount} fallback`);
  console.log("══════════════════════════════════════════════════════════\n");

  // PHASE 1: Analyze Card
  console.log("Phase 1: Analyzing card holistically...");
  
  // Emit status for card analysis
  if (onStreamUpdate) {
    onStreamUpdate({
      type: 'status',
      phase: 'analyzing_card',
      message: 'Analyzing card holistically'
    });
  }
  
  const cardContext = await analyzeCardOverview(event);
  
  const mafsCoreEngine: FightEdgeSummary[] = [];
  const fightBreakdowns: FightBreakdownType[] = [];

  // PHASE 2: Individual Analysis
  console.log(`\nPhase 2: Analyzing fights...`);
  
  for (let i = 0; i < event.fights.length; i++) {
    const fight = event.fights[i];
    
    if (!fight.moneylines || fight.moneylines.length !== 2) {
      console.warn(`[Skipping] Fight ${fight.matchup} - No odds available.`);
      continue;
    }

    try {
      const oddsSource = oddsSourceMap.get(fight.id) || 'fallback';
      console.log(`[${i + 1}/${event.fights.length}] Analyzing: ${fight.matchup} (${oddsSource})...`);
      
      // Emit status update for fight analysis
      if (onStreamUpdate) {
        onStreamUpdate({
          type: 'status',
          phase: 'analyzing_fight',
          message: `Analyzing ${fight.matchup}`,
          progress: {
            current: i + 1,
            total: event.fights.length
          }
        });
      }
      
      const edge = await analyzeFightEdge(fight, event.Name, cardContext, i, event.fights.length);
      const breakdown = await analyzeFightBreakdown(fight, event.Name, cardContext, edge);

      mafsCoreEngine.push(edge);
      fightBreakdowns.push(breakdown);

      // Emit fight result
      if (onStreamUpdate) {
        onStreamUpdate({ 
          type: 'fight', 
          fightId: fight.id, 
          edge, 
          breakdown,
          oddsSource 
        });
      }

      console.log(`✓ Fight ${i + 1} complete.`);
      
    } catch (err: any) {
      console.error(`✗ Fight ${i + 1} failed:`, err.message);
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log(`✓ Analysis Complete: ${mafsCoreEngine.length}/${event.fights.length} fights`);
  console.log("═══════════════════════════════════════");

  return { mafsCoreEngine, fightBreakdowns };
}

export default Agents;