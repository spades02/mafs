// schemas/fight-edge.ts
import { z } from "zod";

export const FightEdgeSummarySchema = z.object({
  id: z.string().min(1),
  fight: z.string().min(1),            // "Strickland vs Adesanya"
  score: z.number().int().nonnegative(), // 94
  rank: z.string().min(1),             // "#1 Highest EV"
  bet: z.string().min(1),              // "Strickland ML +500"
  ev: z.string().min(1),               // "+28.7%"
  truth: z.string().min(1),            // "True: -110 / Book: +120"
  confidence: z.string().min(1),       // "88%" — keep as string if you store "%" suffix
  risk: z.string().min(1),             // "Medium"
  tier: z.string().min(1),             // "A+"
});

// array/schema + inferred TypeScript type
export const FightEdgeSummaryArraySchema = z.object({
  fights: z.array(FightEdgeSummarySchema)
});
export type FightEdgeSummary = z.infer<typeof FightEdgeSummarySchema>;
