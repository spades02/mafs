import { z } from "zod";
import { whyMafsLikesThis, whyMafsLikesThisInput } from "./why-mafs-likes-this";

const FightEdgeSummaryInput = z.looseObject({
  fight: z.string(),
  methodOfVictory: z.string(),
  bet: z.string(),
  score: z.number(),
  rank: z.number(),
  ev: z.coerce.number().nullable(),
  oddsUnavailable: z.boolean().optional(),
  truthProbability: z.coerce.number().min(0).max(1),
  marketProbability: z.coerce.number().min(0).max(1),
  confidence: z.coerce.number().min(0).max(100),
  risk: z.coerce.number().min(0).max(100),
  tier: z.string(),
  recommendedStake: z.coerce.number().min(0).max(100),
  rationale: whyMafsLikesThis,
});

export const FightEdgeSummarySchema =
  z.strictObject({
    fight: z.string(),
    methodOfVictory: z.string(),
    bet: z.string(),
    score: z.number(),
    rank: z.number(),
    ev: z.number().nullable(),
    oddsUnavailable: z.boolean().optional(),
    truthProbability: z.number(),
    marketProbability: z.number(),
    confidence: z.number(),
    risk: z.number(),
    tier: z.string(),
    recommendedStake: z.number(),
    rationale: whyMafsLikesThisInput,
  })
    .transform((data) => ({
      ...data,
      rationale: whyMafsLikesThis.parse(data.rationale),
    }));


export const FightEdgeSummaryArraySchema = z
  .object({
    fights: z
      .array(FightEdgeSummarySchema)
      .min(1, "Exactly one fight is required")
      .max(1, "Only one fight is allowed"),
  })
  .strict(); // 🔒 exact shape only

export type FightEdgeSummary = z.infer<typeof FightEdgeSummarySchema>;

export const FightEdgeSummaryGenerationSchema = z.strictObject({
  fight: z.string(),
  methodOfVictory: z.string(),
  bet: z.string(),
  score: z.number(),
  rank: z.number(),
  // Note: EV is calculated server-side, not by AI
  truthProbability: z.number().min(0).max(1), // Must be 0-1 decimal
  marketProbability: z.number().min(0).max(1).optional(),
  confidence: z.number().min(0).max(100),
  risk: z.number().min(0).max(100),
  tier: z.string(),
  recommendedStake: z.number().min(0).max(100),
  rationale: whyMafsLikesThis,
  summary: z.string().optional(),
});

