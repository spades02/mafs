import { getActiveCalibrationConfig } from "./get-active-config";

export type Thresholds = {
  MIN_MAF_PROB: number;
  MIN_EDGE_PCT: number;
  MIN_AGENT_CONSENSUS_PASS_RATE: number;
  BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW: number;
};

const DEFAULTS: Thresholds = {
  MIN_MAF_PROB: 0.55,
  MIN_EDGE_PCT: 0.5,
  MIN_AGENT_CONSENSUS_PASS_RATE: 0.6,
  BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW: 0.55,
};

export async function getThresholds(): Promise<Thresholds> {
  try {
    const config = await getActiveCalibrationConfig();
    return {
      MIN_MAF_PROB: config.minModelProb,
      MIN_EDGE_PCT: config.minEdgePct,
      MIN_AGENT_CONSENSUS_PASS_RATE: config.minAgentConsensus,
      BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW: config.highVarConfFloor,
    };
  } catch {
    return DEFAULTS;
  }
}
