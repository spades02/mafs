import {
  computeCalibration,
  computePerformanceByEdgeBucket,
  computePerformanceByMarket,
  computeAgentSignalAccuracy,
} from "./compute-metrics";
import { CalibrationConfig } from "./get-active-config";

// Utility: clamp value within bounds
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

type GradedPrediction = {
  modelProb: number;
  marketProb: number | null;
  edgePct: number | null;
  betType: string;
  confidencePct: number | null;
  varianceTag: string | null;
  outcome: string;
  closingProb: number | null;
  clv: number | null;
  profitUnits: number | null;
  agentSignals: Array<{ name: string; signal: string }> | null;
};

export function generateNewConfig(
  predictions: GradedPrediction[],
  current: CalibrationConfig
): {
  config: Omit<CalibrationConfig, never>;
  calibrationScore: number;
  sampleSize: number;
  notes: string;
} {
  const { bins, brierScore } = computeCalibration(predictions);
  const marketPerf = computePerformanceByMarket(predictions);
  const signalAccuracy = computeAgentSignalAccuracy(predictions);

  const notes: string[] = [];
  const actionablePreds = predictions.filter(
    (p) => p.outcome === "win" || p.outcome === "loss"
  );

  // --- 1. Confidence Scaling ---
  // If model is over-confident, reduce the multiplier
  let newMultiplier = current.confidenceScaling.multiplier;
  if (bins.length >= 3) {
    const totalWeightedRatio = bins.reduce((s, b) => {
      if (b.predicted > 0) {
        return s + (b.actual / b.predicted) * b.count;
      }
      return s;
    }, 0);
    const totalCount = bins.reduce((s, b) => s + b.count, 0);
    if (totalCount > 0) {
      const avgRatio = totalWeightedRatio / totalCount;
      // Blend: 70% current + 30% observed ratio (conservative update)
      newMultiplier = current.confidenceScaling.multiplier * 0.7 + avgRatio * 0.3;
      newMultiplier = clamp(newMultiplier, 0.7, 1.3);
      notes.push(`Confidence multiplier: ${newMultiplier.toFixed(3)}`);
    }
  }

  // --- 2. Market Edge Thresholds ---
  const newMarketThresholds = { ...current.marketEdgeThresholds };
  for (const mp of marketPerf) {
    if (mp.count < 5) continue; // need minimum sample

    if (mp.roi < -0.1) {
      // Negative ROI in this market — raise threshold
      const currentThreshold = newMarketThresholds[mp.market] ?? current.minEdgePct;
      newMarketThresholds[mp.market] = clamp(currentThreshold + 0.5, 0.5, 10.0);
      notes.push(`Raised ${mp.market} threshold to ${newMarketThresholds[mp.market]}`);
    } else if (mp.roi > 0.1 && (newMarketThresholds[mp.market] ?? 0) > current.minEdgePct) {
      // Positive ROI — can loosen slightly
      newMarketThresholds[mp.market] = clamp(
        (newMarketThresholds[mp.market] ?? current.minEdgePct) - 0.25,
        0.5,
        10.0
      );
    }
  }

  // --- 3. Variance Penalties ---
  const newVariancePenalties = { ...current.variancePenalties };
  const varianceGroups = new Map<string, GradedPrediction[]>();
  for (const p of actionablePreds) {
    if (!p.varianceTag) continue;
    const arr = varianceGroups.get(p.varianceTag) ?? [];
    arr.push(p);
    varianceGroups.set(p.varianceTag, arr);
  }

  for (const [tag, preds] of varianceGroups) {
    if (preds.length < 5) continue;
    const roi = preds.reduce((s, p) => s + (p.profitUnits ?? 0), 0) / preds.length;

    if (roi < -0.15) {
      // Underperforming variance category — increase penalty
      newVariancePenalties[tag] = clamp(
        (newVariancePenalties[tag] ?? 0) - 2,
        -20,
        10
      );
      notes.push(`Increased penalty for ${tag} variance to ${newVariancePenalties[tag]}`);
    } else if (roi > 0.05) {
      // Performing well — reduce penalty slightly
      newVariancePenalties[tag] = clamp(
        (newVariancePenalties[tag] ?? 0) + 1,
        -20,
        10
      );
    }
  }

  // --- 4. Agent Signal Weights ---
  const newSignalWeights = { ...current.agentSignalWeights };
  if (signalAccuracy.length > 0) {
    const avgAccuracy =
      signalAccuracy.reduce((s, sig) => s + sig.passAccuracy, 0) /
      signalAccuracy.length;

    for (const sig of signalAccuracy) {
      if (sig.passTotal < 5) continue; // need minimum sample
      // Weight = accuracy relative to average
      const weight = avgAccuracy > 0 ? sig.passAccuracy / avgAccuracy : 1;
      // Blend with current weight
      const currentWeight = newSignalWeights[sig.signalName] ?? 1.0;
      newSignalWeights[sig.signalName] = clamp(
        currentWeight * 0.7 + weight * 0.3,
        0.5,
        2.0
      );
    }
    notes.push(
      `Signal weights updated: ${signalAccuracy.map((s) => `${s.signalName}=${(newSignalWeights[s.signalName] ?? 1).toFixed(2)}`).join(", ")}`
    );
  }

  // --- 5. Global Threshold Adjustments ---
  let newMinModelProb = current.minModelProb;
  let newMinEdgePct = current.minEdgePct;
  const overallRoi =
    actionablePreds.length > 0
      ? actionablePreds.reduce((s, p) => s + (p.profitUnits ?? 0), 0) /
        actionablePreds.length
      : 0;

  if (overallRoi < -0.1 && actionablePreds.length >= 20) {
    // Losing money — tighten thresholds
    newMinModelProb = clamp(newMinModelProb + 0.02, 0.45, 0.7);
    newMinEdgePct = clamp(newMinEdgePct + 0.5, 0.5, 5.0);
    notes.push(`Tightened thresholds: minProb=${newMinModelProb}, minEdge=${newMinEdgePct}`);
  } else if (overallRoi > 0.05 && actionablePreds.length >= 20) {
    // Profitable — can loosen slightly
    newMinModelProb = clamp(newMinModelProb - 0.01, 0.45, 0.7);
    newMinEdgePct = clamp(newMinEdgePct - 0.25, 0.5, 5.0);
  }

  return {
    config: {
      minModelProb: newMinModelProb,
      minEdgePct: newMinEdgePct,
      minAgentConsensus: current.minAgentConsensus,
      highVarConfFloor: current.highVarConfFloor,
      marketEdgeThresholds: newMarketThresholds,
      confidenceScaling: {
        ...current.confidenceScaling,
        multiplier: newMultiplier,
      },
      variancePenalties: newVariancePenalties,
      agentSignalWeights: newSignalWeights,
    },
    calibrationScore: brierScore,
    sampleSize: actionablePreds.length,
    notes: notes.join("; ") || "No adjustments needed",
  };
}
