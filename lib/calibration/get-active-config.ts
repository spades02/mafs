import { db } from "@/db";
import { calibrationConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export type CalibrationConfig = {
  minModelProb: number;
  minEdgePct: number;
  minAgentConsensus: number;
  highVarConfFloor: number;
  marketEdgeThresholds: Record<string, number>;
  confidenceScaling: { multiplier: number; clampMin: number; clampMax: number };
  variancePenalties: Record<string, number>;
  agentSignalWeights: Record<string, number>;
};

const DEFAULTS: CalibrationConfig = {
  minModelProb: 0.55,
  minEdgePct: 0.5,
  minAgentConsensus: 0.6,
  highVarConfFloor: 0.55,
  marketEdgeThresholds: {},
  confidenceScaling: { multiplier: 1.0, clampMin: 30, clampMax: 95 },
  variancePenalties: { high: 0, medium: 0, low: 0 },
  agentSignalWeights: {},
};

export async function getActiveCalibrationConfig(): Promise<CalibrationConfig> {
  const [row] = await db
    .select()
    .from(calibrationConfigs)
    .where(eq(calibrationConfigs.isActive, true))
    .limit(1);

  if (!row) return DEFAULTS;

  return {
    minModelProb: row.minModelProb ?? DEFAULTS.minModelProb,
    minEdgePct: row.minEdgePct ?? DEFAULTS.minEdgePct,
    minAgentConsensus: row.minAgentConsensus ?? DEFAULTS.minAgentConsensus,
    highVarConfFloor: row.highVarConfFloor ?? DEFAULTS.highVarConfFloor,
    marketEdgeThresholds: (row.marketEdgeThresholds as Record<string, number>) ?? DEFAULTS.marketEdgeThresholds,
    confidenceScaling: (row.confidenceScaling as CalibrationConfig["confidenceScaling"]) ?? DEFAULTS.confidenceScaling,
    variancePenalties: (row.variancePenalties as Record<string, number>) ?? DEFAULTS.variancePenalties,
    agentSignalWeights: (row.agentSignalWeights as Record<string, number>) ?? DEFAULTS.agentSignalWeights,
  };
}
