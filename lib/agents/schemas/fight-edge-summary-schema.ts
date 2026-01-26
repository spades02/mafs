import { z } from "zod";

// --- Nested Types ---

export const AgentSignalInputSchema = z.object({
  name: z.string(),
  signal: z.enum(["pass", "neutral", "fail"]),
  desc: z.string().describe("Short reason for this signal"),
});

export const DetailedReasonInputSchema = z.object({
  marketInefficiency: z.string().describe("Why the market is wrong"),
  keyDrivers: z.array(z.string()).describe("3-4 bullet points supporting the bet"),
  riskFactors: z.array(z.string()).describe("2-3 main risks"),
});

// --- Main Schema ---

export const FightEdgeSummaryGenerationSchema = z.object({
  // Basic Info
  fight: z.string(),
  bet_type: z.enum(["ML", "ITD", "Over", "Under", "Spread", "Prop", "No Bet"]).describe("Type of bet"),
  label: z.string().describe("e.g. 'Pereira ITD', 'Volk ML'"),

  // Probabilities
  truthProbability: z.number().min(0).max(1).describe("My estimated win probability (0-1)"),

  // Scores
  stability_score: z.number().min(0).max(1).describe("How stable/reliable is this simulation result?"),
  confidence_label: z.enum(["Low", "Medium", "High"]),
  confidencePct: z.number().min(0).max(100).describe("Confidence percentage (0-100)"),
  varianceTag: z.enum(["low", "medium", "high"]).describe("Level of chaos/randomness expected"),

  // Explanations
  reason: z.string().describe("1 sentence summary"),
  detailedReason: DetailedReasonInputSchema,
  executiveSummary: z.string().optional().describe("3-4 sentences deep dive summary"),

  // Intelligence
  agentSignals: z.array(AgentSignalInputSchema).optional().describe("Signals from at least 3 distinct agents (e.g. Model, Market, Style)"),
  patternInsight: z.string().optional().describe("If a specific statistical pattern is detected"),
  patternMechanics: z.array(z.string()).optional(),
  marketThesis: z.string().optional().describe("Why is the market pricing this incorrectly?"),
  edgeSource: z.string().optional().describe("What is the source of our edge? (e.g. 'Latency', 'Chin Durability', 'Cardio')"),

  // Legacy/Compat fields (Optional or computed later)
  rank: z.number().optional().default(0),
  score: z.number().optional().default(0),
});

export type FightEdgeSummary = z.infer<typeof FightEdgeSummaryGenerationSchema> & {
  // These will be calculated/injected by the engine
  id: string | number;
  odds_american: string;
  P_sim: number; // mapped from truthProbability
  P_imp: number; // calculated from odds
  edge_pct: number; // calculated
  status?: "qualified" | "filtered";
  rejectReasons?: string[];
  ev?: number | null; // Legacy compat
};
