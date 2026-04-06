import { NextResponse } from "next/server";
import { db } from "@/db";

import {
  predictionLogs,
  predictionOutcomes,
  calibrationConfigs,
  agentSignalPerformance,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  computeCalibration,
  computeCLV,
  computePerformanceByEdgeBucket,
  computePerformanceByMarket,
} from "@/lib/calibration/compute-metrics";

export async function GET() {
  try {
    // Fetch all graded predictions
    const graded = await db
      .select({
        modelProb: predictionLogs.modelProb,
        marketProb: predictionLogs.marketProb,
        edgePct: predictionLogs.edgePct,
        betType: predictionLogs.betType,
        confidencePct: predictionLogs.confidencePct,
        varianceTag: predictionLogs.varianceTag,
        agentSignals: predictionLogs.agentSignals,
        outcome: predictionOutcomes.outcome,
        closingProb: predictionOutcomes.closingProb,
        clv: predictionOutcomes.clv,
        profitUnits: predictionOutcomes.profitUnits,
      })
      .from(predictionOutcomes)
      .innerJoin(
        predictionLogs,
        eq(predictionOutcomes.predictionLogId, predictionLogs.id)
      );

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const calibration = computeCalibration(graded as any);
    const clv = computeCLV(graded as any);
    const edgeBuckets = computePerformanceByEdgeBucket(graded as any);
    const marketPerformance = computePerformanceByMarket(graded as any);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Get latest signal performance
    const [latestConfig] = await db
      .select()
      .from(calibrationConfigs)
      .orderBy(desc(calibrationConfigs.version))
      .limit(1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let signalPerformance: any[] = [];
    if (latestConfig) {
      signalPerformance = await db
        .select()
        .from(agentSignalPerformance)
        .where(
          eq(agentSignalPerformance.configVersion, latestConfig.version)
        );
    }

    // Config history
    const configHistory = await db
      .select()
      .from(calibrationConfigs)
      .orderBy(desc(calibrationConfigs.version))
      .limit(10);

    return NextResponse.json({
      calibration,
      clv,
      edgeBuckets,
      marketPerformance,
      signalPerformance,
      configHistory,
      totalPredictions: graded.length,
    });
  } catch (error) {
    console.error("[Metrics] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to compute metrics" },
      { status: 500 }
    );
  }
}
