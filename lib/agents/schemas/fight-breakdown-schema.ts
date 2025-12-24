import { z } from "zod";

/* ---------- Shared Numeric Helpers ---------- */

const ProbabilitySchema = z
  .number()
  .min(0)
  .max(1); // 0.70 === 70%

const PercentageSchema = z
  .number()
  .min(0)
  .max(100); // 70 === 70%

/* ---------- Path to Victory ---------- */

export const PathToVictorySchema = z.object({
  method: z.string().min(1),
  probability: ProbabilitySchema,
});

/* ---------- Why Line Exists ---------- */

export const WhyLineExistsSchema = z.object({
  reason: z.string().min(1),
});

/* ---------- Fight Breakdown (Per Fight) ---------- */

export const FightBreakdownSchema = z.object({
  id: z.string().min(1),

  fight: z.string().min(1),

  /* Core analytics */
  score: z.number().min(0).max(100),
  // example: 85

  rank: z.number().int().positive(),
  // example: 1 = highest ranked edge on card

  ev: z.number(),
  // example: 6.4 (expected value)

  trueProbability: ProbabilitySchema,
  // example: 0.72

  marketProbability: ProbabilitySchema,
  // example: 0.61

  confidence: z.number().min(0).max(100),
  // example: 78

  risk: z.number().min(0).max(100),
  // example: 42

  tier: z.number().int().positive(),
  // example: 1, 2, 3

  recommendedStake: PercentageSchema,
  // example: 5 === 5% bankroll

  /* Pricing */
  trueOdds: z.number(),
  marketOdds: z.number(),

  /* Explanations */
  pathToVictory: z.array(PathToVictorySchema),

  whyLineExists: z.array(WhyLineExistsSchema),
});

/* ---------- Breakdown Collection ---------- */

export const FightBreakdownsSchema = z.object({
  breakdowns: z.array(FightBreakdownSchema).min(1),
});

export const EventEdgeSummarySchema = z.object({
  eventId: z.number().int().positive(),

  totalFightsAnalyzed: z.number().int().nonnegative(),

  bestEdgeScore: z.number().min(0).max(100),

  averageEV: z.number(),

  averageConfidence: z.number().min(0).max(100),

  topTierPlays: z.number().int().nonnegative(),

  riskWeightedExposure: PercentageSchema,
  // total % of bankroll recommended across all plays
});
