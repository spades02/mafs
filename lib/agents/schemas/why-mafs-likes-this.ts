import { z } from "zod";

export const whyMafsLikesThisInput = z.strictObject({
  title: z.string().optional(),

  sections: z.object({
    marketInefficiencyDetected: z.array(z.string()).optional(),
    matchupDrivers: z.array(z.string()).optional(),
    dataSignalsAligned: z.array(z.string()).optional(),
    riskFactors: z.array(z.string()).optional(),
    whyThisLineNotOthers: z.array(z.string()).optional(),
  }).optional(),

  summary: z.string().optional(),
});

export const whyMafsLikesThis = z.object({
  title: z.string().default("Analysis"),

  sections: z.object({
    marketInefficiencyDetected: z.array(z.string()).default([]),
    matchupDrivers: z.array(z.string()).default([]),
    dataSignalsAligned: z.array(z.string()).default([]),
    riskFactors: z.array(z.string()).default([]),
    whyThisLineNotOthers: z.array(z.string()).default([]),
  }).default({
    // 🔴 FIX: You must explicitly provide these keys for the default object
    marketInefficiencyDetected: [],
    matchupDrivers: [],
    dataSignalsAligned: [],
    riskFactors: [],
    whyThisLineNotOthers: [],
  }),

  // 🛡️ Fail-safe: specific key the AI keeps putting at the root
  whyThisLineNotOthers: z.array(z.string()).default([]),

  summary: z.string().default(""),
}).catchall(z.any()); // 🛡️ Allow extra keys without crashing