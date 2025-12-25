import { z } from "zod";
import { whyMafsLikesThis } from "./why-mafs-likes-this";

export const FightEdgeSummarySchema = z.object({
  id: z.number().int().positive(),

  fight: z.string().min(1),

  methodOfVictory: z.string().min(1),

  bet: z.string().min(1),

  // Core numeric indicators
  score: z.number().min(0).max(100),

  // 1 = best edge on card
  rank: z.number().int().positive(),

  // Expected value (percentage terms, 0–100)
  ev: z.number(),

  // Fair win probability
  truthProbability: z.number().min(0).max(1),

  // Implied sportsbook probability
  marketProbability: z.number().min(0).max(1),

  confidence: z.number().min(0).max(100),

  risk: z.number().min(0).max(100),

  tier: z.string().min(1),

  // Bankroll percentage
  recommendedStake: z.number().min(0).max(100),

  // AI reasoning block
  rationale: whyMafsLikesThis,
});

export const FightEdgeSummaryArraySchema = z.object({
  fights: z.array(FightEdgeSummarySchema).min(1),
});

export type FightEdgeSummary = z.infer<typeof FightEdgeSummarySchema>;
