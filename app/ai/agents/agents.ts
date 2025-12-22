import { FightEdgeSummaryArraySchema } from "@/lib/agents/output-schemas";
import { FightBreakdownsSchema } from "@/lib/agents/fight-breakdown-schema";
import { MAFS_PROMPT } from "@/lib/agents/prompts";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

type SimplifiedFight = {
  matchup: string;
  moneylines: number[];
};

type SimplifiedEvent = {
  EventId: string;
  Name: string;
  fights: SimplifiedFight[];
};

type AgentResult = {
  mafsCoreEngine: any[];
  fightBreakdowns: any[];
};

/* ---------------------------------------------
   SINGLE FIGHT → EDGE SUMMARY
--------------------------------------------- */
async function analyzeFightEdge(
  fight: SimplifiedFight,
  eventName: string
) {
  const { object } = await generateObject({
    model: anthropic("claude-3-haiku-20240307"),
    schema: FightEdgeSummaryArraySchema,
    maxOutputTokens: 500,
    system: MAFS_PROMPT,
    prompt: `
Event: ${eventName}

Analyze EXACTLY ONE fight.

Fight:
${fight.matchup}

Moneylines:
${fight.moneylines.join(" / ")}

Return JSON with:
{
  fights: [ { ...ONE fight only... } ]
}

Rules:
- fights MUST be an array of length 1
- No schema text
- No explanations
- No placeholders
- Output JSON ONLY
`,
  });

  return object.fights[0];
}

/* ---------------------------------------------
   SINGLE FIGHT → BREAKDOWN
--------------------------------------------- */
async function analyzeFightBreakdown(
  fight: SimplifiedFight,
  eventName: string
) {
  const { object } = await generateObject({
    model: anthropic("claude-3-haiku-20240307"),
    schema: FightBreakdownsSchema,
    maxOutputTokens: 700,
    system: MAFS_PROMPT,
    prompt: `
Event: ${eventName}

Analyze EXACTLY ONE fight.

Fight:
${fight.matchup}

Moneylines:
${fight.moneylines.join(" / ")}

Return JSON with:
{
  breakdowns: [ { ...ONE breakdown only... } ]
}

Rules:
- breakdowns MUST be an array of length 1
- score is REQUIRED (string like "8.4/10")
- No schema text
- No placeholders
- No explanations
- Output JSON ONLY
`,
  });

  return object.breakdowns[0];
}

/* ---------------------------------------------
   MAIN AGENT
--------------------------------------------- */
async function Agents(event: SimplifiedEvent): Promise<AgentResult> {
  const mafsCoreEngine: any[] = [];
  const fightBreakdowns: any[] = [];

  for (const fight of event.fights) {
    try {
      const edge = await analyzeFightEdge(fight, event.Name);
      mafsCoreEngine.push(edge);
    } catch (err) {
      console.error("Edge analysis failed:", fight.matchup, err);
    }

    try {
      const breakdown = await analyzeFightBreakdown(fight, event.Name);
      fightBreakdowns.push(breakdown);
    } catch (err) {
      console.error("Breakdown failed:", fight.matchup, err);
    }
  }

  return {
    mafsCoreEngine,
    fightBreakdowns,
  };
}

export default Agents;
