import { FightBreakdownsSchema } from "@/lib/agents/schemas/fight-breakdown-schema";
import { MAFS_PROMPT } from "@/lib/agents/prompts";
import { generateObject } from "ai";
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
   SINGLE FIGHT → EDGE SUMMARY
--------------------------------------------- */
export async function analyzeFightEdge(
  fight: SimplifiedFight,
  eventName: string,
  baseContext: string
) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    temperature: 0.05,
    schema: FightEdgeSummaryArraySchema,
    maxOutputTokens: 900,
    system: MAFS_PROMPT,
    prompt: `
${baseContext}

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
- fights MUST be array length 1
- Output JSON ONLY
`,
  });

  if (!object?.fights?.[0]) {
    throw new Error("No fight returned from edge agent");
  }

  return object.fights[0];
}

/* ---------------------------------------------
   SINGLE FIGHT → BREAKDOWN
--------------------------------------------- */
export async function analyzeFightBreakdown(
  fight: SimplifiedFight,
  eventName: string,
  baseContext: string
) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    temperature: 0.1,
    schema: FightBreakdownsSchema,
    maxOutputTokens: 700,
    system: MAFS_PROMPT,
    prompt: `
${baseContext}

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
- keep the id same as provided
- breakdowns MUST be an array of length 1
- score is REQUIRED
- Output JSON ONLY
`,
  });

  return object.breakdowns[0];
}

async function Agents(
  event: SimplifiedEvent,
  onFightComplete?: StreamCallback
): Promise<{ mafsCoreEngine: FightEdgeSummary[]; fightBreakdowns: FightBreakdownType[] }> {
  const fightIdMap = event.fights.map(f => ({
    id: f.id,
    matchup: f.matchup,
  }));

  const baseContext = `
You are given fights with FIXED IDs.

These IDs are IMMUTABLE.
You MUST reuse the same id.
DO NOT create new IDs.
DO NOT renumber.

VALID FIGHTS:
${JSON.stringify(fightIdMap, null, 2)}
`;

  const mafsCoreEngine: FightEdgeSummary[] = [];
  const fightBreakdowns: FightBreakdownType[] = [];

  for (const fight of event.fights) {
    try {
      // Analyze both edge and breakdown for this fight
      const [edge, breakdown] = await Promise.all([
        analyzeFightEdge(fight, event.Name, baseContext),
        analyzeFightBreakdown(fight, event.Name, baseContext),
      ]);

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
    } catch (err) {
      console.error("Fight analysis failed:", fight.matchup, err);
    }
  }

  return {
    mafsCoreEngine,
    fightBreakdowns,
  };
}

export default Agents;