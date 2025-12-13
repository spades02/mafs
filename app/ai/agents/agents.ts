import { FightEdgeSummaryArraySchema } from "@/lib/agents/output-schemas";
import { FightBreakdownsSchema } from "@/lib/agents/fight-breakdown-schema";
import { MAFS_PROMPT } from "@/lib/agents/prompts";
import { generateObject } from "ai";

type AgentResult = {
  mafsCoreEngine: any;
  fightBreakdowns: any;
};

async function Agents(eventData: string): Promise<AgentResult> {
  // Fixed: Remove invalid and unnecessary property access on Zod schema internals
  console.log("Schema definition:", FightEdgeSummaryArraySchema);

  const { object: result1 } = await generateObject({
    model: "anthropic/claude-opus-4.5",
    system: MAFS_PROMPT,
    schema: FightEdgeSummaryArraySchema,
    mode: "json",
    prompt: `Evaluate this event using the full MAFS pricing engine:
${eventData}`
  });

  const { object: result2 } = await generateObject({
    model: "anthropic/claude-opus-4.5",
    system: MAFS_PROMPT,
    schema: FightBreakdownsSchema,
    mode: "json",
    prompt: `Provide detailed fight breakdowns for this event using MAFS pricing protocols:
${eventData}`
  });
  console.log("result 1: ", result1);
  console.log("result 2: ", result2);
  
  return { 
    mafsCoreEngine: result1.fights,
    fightBreakdowns: result2.breakdowns
  };
}

export default Agents;