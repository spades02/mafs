import { z } from "zod";

export const FightBreakdownSchema = z.object({
  // Basic lines
  trueLine: z.string().optional().describe("My fair line, both sides e.g. '-200 / +170'"),
  marketLine: z.string().optional().describe("Current market line, both sides e.g. '-150 / +130'"),
  mispricing: z.string().optional().describe("Percentage mispricing e.g. '+5.2%'"),

  // Bet details
  bet: z.string().optional().describe("Recommended bet label"),
  ev: z.string().optional().describe("Expected Value percentage e.g. '+12.5%'"),
  confidence: z.string().optional().describe("Confidence percentage string e.g. '75%'"),
  risk: z.string().optional().describe("Risk level: Low, Medium, High"),
  stake: z.string().optional().describe("Recommended stake e.g. '1.5 units'"),

  // Fighters
  fighter1Name: z.string().optional(),
  fighter2Name: z.string().optional(),
  fighter1Notes: z.string().optional().describe("Short analysis of fighter 1 strengths/weaknesses in this matchup"),
  fighter2Notes: z.string().optional().describe("Short analysis of fighter 2 strengths/weaknesses in this matchup"),
  fighter1Profile: z.string().optional().describe("One sentence profile: e.g. 'Pressure-driven output with elite cardio durability...'"),
  fighter2Profile: z.string().optional().describe("One sentence profile: e.g. 'Counter-striking profile showing late-round decline...'"),

  // Deep Dive
  pathToVictory: z.string().optional().describe("Most likely outcomes separated by pipe | e.g. 'Pereira KO (45%) | Decision (20%)'"),
  outcomeDistribution: z.string().optional().describe("Detailed outcome distribution string e.g. 'Du Plessis: TKO R3-R5 (48%) | Adesanya: KO R1-R2 (28%) | Decision (24%)'"),
  marketAnalysis: z.array(z.string()).optional().describe("Why the market line exists and why it is wrong"),
  varianceReason: z.string().optional().describe("If variance is high, why?"),
  primaryRisk: z.string().optional().describe("The biggest threat to this bet"),

  // Model Metadata
  modelConfidence: z.string().optional().describe("Model confidence percentage e.g. '81%'"),
  signalStrength: z.string().optional().describe("Signal strength: Strong, Moderate, Weak"),
  modelLeaningOutcome: z.string().optional().describe("Model leaning outcome e.g. 'Du Plessis ITD +140'"),
  playableUpTo: z.string().optional().describe("Price playable up to e.g. '+140'"),
  variance: z.string().optional().describe("Variance level e.g. 'Medium (late-finish dependency)'"),

  // Fallback for nested structure (Model sometimes nests analysis)
  fightAnalysis: z.object({
    trueLine: z.string().optional(),
    marketLine: z.string().optional(),
    mispricing: z.string().optional(),
    pathToVictory: z.string().optional(),
    marketAnalysis: z.array(z.string()).optional(),
  }).optional(),
});

export const FightBreakdownsSchema = z.object({
  breakdowns: z.array(FightBreakdownSchema).min(1),
});

export type FightBreakdownType = z.infer<typeof FightBreakdownSchema>;