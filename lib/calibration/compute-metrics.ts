type GradedPrediction = {
  modelProb: number;
  marketProb: number | null;
  edgePct: number | null;
  betType: string;
  confidencePct: number | null;
  varianceTag: string | null;
  outcome: string; // "win" | "loss" | "push" | "void"
  closingProb: number | null;
  clv: number | null;
  profitUnits: number | null;
  agentSignals: Array<{ name: string; signal: string }> | null;
};

export type CalibrationBin = {
  binStart: number;
  binEnd: number;
  predicted: number; // avg predicted prob in bin
  actual: number; // actual win rate
  count: number;
};

export type EdgeBucketPerformance = {
  bucket: string;
  minEdge: number;
  maxEdge: number;
  count: number;
  wins: number;
  winRate: number;
  roi: number;
  avgClv: number;
};

export type MarketPerformance = {
  market: string;
  count: number;
  wins: number;
  winRate: number;
  roi: number;
  avgClv: number;
};

export type SignalAccuracy = {
  signalName: string;
  passTotal: number;
  passCorrect: number;
  passAccuracy: number;
  failTotal: number;
  failCorrect: number; // fail signal + loss = correct
  failAccuracy: number;
};

// Filter to only actionable predictions (not void/push)
function actionable(preds: GradedPrediction[]) {
  return preds.filter((p) => p.outcome === "win" || p.outcome === "loss");
}

export function computeCalibration(predictions: GradedPrediction[]) {
  const preds = actionable(predictions);
  const bins: CalibrationBin[] = [];

  for (let i = 0; i < 10; i++) {
    const binStart = i * 0.1;
    const binEnd = (i + 1) * 0.1;
    const inBin = preds.filter(
      (p) => p.modelProb >= binStart && p.modelProb < binEnd
    );
    if (inBin.length === 0) continue;

    const predicted = inBin.reduce((s, p) => s + p.modelProb, 0) / inBin.length;
    const actual = inBin.filter((p) => p.outcome === "win").length / inBin.length;
    bins.push({ binStart, binEnd, predicted, actual, count: inBin.length });
  }

  // Brier score: mean of (predicted - actual_binary)^2
  const brierScore =
    preds.length > 0
      ? preds.reduce((s, p) => {
          const actual = p.outcome === "win" ? 1 : 0;
          return s + (p.modelProb - actual) ** 2;
        }, 0) / preds.length
      : 1;

  // Calibration error: mean absolute deviation per bin
  const calibrationError =
    bins.length > 0
      ? bins.reduce((s, b) => s + Math.abs(b.predicted - b.actual) * b.count, 0) /
        preds.length
      : 1;

  return { bins, brierScore, calibrationError };
}

export function computeCLV(predictions: GradedPrediction[]) {
  const preds = actionable(predictions).filter((p) => p.clv !== null);
  const avgClv =
    preds.length > 0
      ? preds.reduce((s, p) => s + (p.clv ?? 0), 0) / preds.length
      : 0;

  // By market
  const byMarket = new Map<string, number[]>();
  for (const p of preds) {
    const arr = byMarket.get(p.betType) ?? [];
    arr.push(p.clv ?? 0);
    byMarket.set(p.betType, arr);
  }

  const marketClv: Record<string, number> = {};
  for (const [market, vals] of byMarket) {
    marketClv[market] = vals.reduce((s, v) => s + v, 0) / vals.length;
  }

  return { avgClv, marketClv, sampleSize: preds.length };
}

export function computePerformanceByEdgeBucket(
  predictions: GradedPrediction[]
): EdgeBucketPerformance[] {
  const preds = actionable(predictions);
  const buckets = [
    { bucket: "0-2%", minEdge: 0, maxEdge: 2 },
    { bucket: "2-4%", minEdge: 2, maxEdge: 4 },
    { bucket: "4-6%", minEdge: 4, maxEdge: 6 },
    { bucket: "6-9%", minEdge: 6, maxEdge: 9 },
    { bucket: "9%+", minEdge: 9, maxEdge: Infinity },
  ];

  return buckets.map(({ bucket, minEdge, maxEdge }) => {
    const inBucket = preds.filter(
      (p) =>
        (p.edgePct ?? 0) >= minEdge && (p.edgePct ?? 0) < maxEdge
    );
    const wins = inBucket.filter((p) => p.outcome === "win").length;
    const totalProfit = inBucket.reduce((s, p) => s + (p.profitUnits ?? 0), 0);
    const clvs = inBucket.filter((p) => p.clv !== null);

    return {
      bucket,
      minEdge,
      maxEdge,
      count: inBucket.length,
      wins,
      winRate: inBucket.length > 0 ? wins / inBucket.length : 0,
      roi: inBucket.length > 0 ? totalProfit / inBucket.length : 0,
      avgClv:
        clvs.length > 0
          ? clvs.reduce((s, p) => s + (p.clv ?? 0), 0) / clvs.length
          : 0,
    };
  });
}

export function computePerformanceByMarket(
  predictions: GradedPrediction[]
): MarketPerformance[] {
  const preds = actionable(predictions);
  const grouped = new Map<string, GradedPrediction[]>();

  for (const p of preds) {
    const arr = grouped.get(p.betType) ?? [];
    arr.push(p);
    grouped.set(p.betType, arr);
  }

  return Array.from(grouped.entries()).map(([market, items]) => {
    const wins = items.filter((p) => p.outcome === "win").length;
    const totalProfit = items.reduce((s, p) => s + (p.profitUnits ?? 0), 0);
    const clvs = items.filter((p) => p.clv !== null);

    return {
      market,
      count: items.length,
      wins,
      winRate: wins / items.length,
      roi: totalProfit / items.length,
      avgClv:
        clvs.length > 0
          ? clvs.reduce((s, p) => s + (p.clv ?? 0), 0) / clvs.length
          : 0,
    };
  });
}

export function computeAgentSignalAccuracy(
  predictions: GradedPrediction[]
): SignalAccuracy[] {
  const preds = actionable(predictions);
  const signalMap = new Map<
    string,
    { passTotal: number; passCorrect: number; failTotal: number; failCorrect: number }
  >();

  for (const p of preds) {
    if (!Array.isArray(p.agentSignals)) continue;
    const isWin = p.outcome === "win";

    for (const sig of p.agentSignals) {
      if (!sig?.name || !sig?.signal) continue;
      const entry = signalMap.get(sig.name) ?? {
        passTotal: 0,
        passCorrect: 0,
        failTotal: 0,
        failCorrect: 0,
      };

      if (sig.signal === "pass") {
        entry.passTotal++;
        if (isWin) entry.passCorrect++;
      } else if (sig.signal === "fail") {
        entry.failTotal++;
        if (!isWin) entry.failCorrect++; // fail + loss = signal was correct
      }

      signalMap.set(sig.name, entry);
    }
  }

  return Array.from(signalMap.entries()).map(([signalName, data]) => ({
    signalName,
    ...data,
    passAccuracy: data.passTotal > 0 ? data.passCorrect / data.passTotal : 0,
    failAccuracy: data.failTotal > 0 ? data.failCorrect / data.failTotal : 0,
  }));
}
