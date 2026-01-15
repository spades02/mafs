// lib/agents/schemas/fight-breakdown-schema.ts

import { z } from "zod";

/* ---------- Shared Numeric Helpers ---------- */

const ProbabilitySchema = z.number().min(0).max(1).default(0.5);
const PercentageSchema = z.number().default(0);

/* ---------- Nested ---------- */

// 1. Define the shapes clearly
const LineSchema = z.object({
  fighter: z.string().default("Unknown"),
  odds: z.union([z.number(), z.string()]).default(0),
  prob: z.union([z.number(), z.string()]).default(0.5),
});

const FighterNotesSchema = z.object({
  name: z.string().default("Unknown"),
  notes: z.array(z.string()).default([]),
});

const PathToVictorySchema = z.object({
  path: z.string().default("Unknown path"),
  prob: ProbabilitySchema,
});

/* ---------- Fight Breakdown ---------- */

export const FightBreakdownSchema = z.object({
  fight: z.string().min(1),

  edge: z.number().default(0),
  ev: z.number().default(0),
  score: z.number().default(0), // Fixed the previous error

  // 🔴 FIX: Provide full default objects, not just {}
  trueLine: LineSchema.default({
    fighter: "Unknown",
    odds: 0,
    prob: 0.5,
  }),

  marketLine: LineSchema.default({
    fighter: "Unknown",
    odds: 0,
    prob: 0.5,
  }),

  mispricing: z.number().default(0),

  recommendedBet: z.string().default("No Bet"),
  betEv: z.number().default(0),

  confidence: z.number().default(0),
  risk: z.number().default(0),
  stake: PercentageSchema,

  // 🔴 FIX: Provide full default objects
  fighter1: FighterNotesSchema.default({
    name: "Unknown",
    notes: [],
  }),

  fighter2: FighterNotesSchema.default({
    name: "Unknown",
    notes: [],
  }),

  pathToVictory: z.array(PathToVictorySchema).default([]),
  whyLineExists: z.array(z.string()).default([]),
});

/* ---------- Collection ---------- */

export const FightBreakdownsSchema = z.object({
  breakdowns: z.array(FightBreakdownSchema).min(1),
});

export type FightBreakdownType = z.infer<typeof FightBreakdownSchema>;