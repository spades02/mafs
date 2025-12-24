import { z } from "zod";

export const whyMafsLikesThis = z.object({
  title: z.string().min(1),

  sections: z.object({
    marketInefficiencyDetected: z.array(z.string()).min(3),
    matchupDrivers: z.array(z.string()).min(3),
    dataSignalsAligned: z.array(z.string()).min(4),
    riskFactors: z.array(z.string()).min(3),
    whyThisLineNotOthers: z.array(z.string()).min(3),
  }),

  summary: z.string().min(1),
});
