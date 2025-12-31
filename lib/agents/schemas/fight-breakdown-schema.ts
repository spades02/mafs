import { z } from "zod";

/* ---------- Shared Numeric Helpers ---------- */

const ProbabilitySchema = z.number().min(0).max(1);
const PercentageSchema = z.number().min(0).max(100);

/* ---------- Nested ---------- */

const LineSchema = z.object({
  fighter: z.string().min(1),
  odds: z.number(),
  prob: ProbabilitySchema,
});

const FighterNotesSchema = z.object({
  name: z.string().min(1),
  notes: z.array(z.string().min(1)),
});

const PathToVictorySchema = z.object({
  path: z.string().min(1),
  prob: ProbabilitySchema,
});

/* ---------- Fight Breakdown ---------- */

export const FightBreakdownSchema = z.object({
  id: z.number().int().positive(),

  fight: z.string().min(1),

  edge: z.number().min(0).max(1),

  ev: z.number(),

  score: z.number().min(0).max(100),

  trueLine: LineSchema,

  marketLine: LineSchema,

  mispricing: z.number(),

  recommendedBet: z.string().min(1),

  betEv: z.number(),

  confidence: z.number().min(0).max(100),

  risk: z.number().min(0).max(100),

  stake: PercentageSchema,

  fighter1: FighterNotesSchema,

  fighter2: FighterNotesSchema,

  pathToVictory: z.array(PathToVictorySchema).min(1),

  whyLineExists: z.array(z.string().min(1)),
});

/* ---------- Collection ---------- */

export const FightBreakdownsSchema = z.object({
  breakdowns: z.array(FightBreakdownSchema).min(1),
});

export type FightBreakdownType = z.infer<typeof FightBreakdownSchema>;
