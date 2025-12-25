import { z } from "zod";

export const whyMafsLikesThis = z.object({
  title: z.string().default(""),

  sections: z.object({
    marketInefficiencyDetected: z.array(z.string()).default([]),
    matchupDrivers: z.array(z.string()).default([]),
    dataSignalsAligned: z.array(z.string()).default([]),
    riskFactors: z.array(z.string()).default([]),
    whyThisLineNotOthers: z.array(z.string()).default([]),
  }),

  summary: z.string().default(""),
});
