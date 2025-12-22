import { z } from "zod";

export const FightBreakdownSchema = z.object({
  fight: z.string(),
  edge: z.string(),
  ev: z.string(),
  score: z.string(),
  trueLine: z.object({
    fighter: z.string(),
    odds: z.string(),
    prob: z.string(),
  }),
  marketLine: z.object({
    fighter: z.string(),
    odds: z.string(),
    prob: z.string(),
  }),
  mispricing: z.string(),
  recommendedBet: z.string(),
  betEv: z.string(),
  confidence: z.string(),
  risk: z.string(),
  stake: z.string(),
  fighter1: z.object({
    name: z.string(),
    notes: z.array(z.string()).default([]),
  }),
  fighter2: z.object({
    name: z.string(),
    notes: z.array(z.string()).default([]),
  }),
  pathToVictory: z
    .object({
      path: z.string(),
      prob: z.string(),
    })
    .array(),
  whyLineExists: z.array(z.string()).default([]),
});

export const FightBreakdownsSchema = z.object({
    breakdowns: z.array(FightBreakdownSchema)
  });

  export type FightBreakdown = z.infer<typeof FightBreakdownSchema>;
