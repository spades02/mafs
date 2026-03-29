import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  predictionLogs,
  predictionOutcomes,
  calibrationConfigs,
  agentSignalPerformance,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getActiveCalibrationConfig } from "@/lib/calibration/get-active-config";
import { generateNewConfig } from "@/lib/calibration/recalibrate";
import { computeAgentSignalAccuracy } from "@/lib/calibration/compute-metrics";

const MIN_SAMPLE_SIZE = 30;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const actionable = graded.filter(
      (p) => p.outcome === "win" || p.outcome === "loss"
    );

    if (actionable.length < MIN_SAMPLE_SIZE) {
      return NextResponse.json({
        success: false,
        message: `Need ${MIN_SAMPLE_SIZE} graded predictions, have ${actionable.length}`,
      });
    }

    const currentConfig = await getActiveCalibrationConfig();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { config, calibrationScore, sampleSize, notes } = generateNewConfig(graded as any, currentConfig);

    // Get next version number
    const [latest] = await db
      .select({ version: calibrationConfigs.version })
      .from(calibrationConfigs)
      .orderBy(desc(calibrationConfigs.version))
      .limit(1);

    const nextVersion = (latest?.version ?? 0) + 1;

    // Deactivate current active config
    await db
      .update(calibrationConfigs)
      .set({ isActive: false })
      .where(eq(calibrationConfigs.isActive, true));

    // Insert new config
    await db.insert(calibrationConfigs).values({
      id: nanoid(),
      version: nextVersion,
      isActive: true,
      minModelProb: config.minModelProb,
      minEdgePct: config.minEdgePct,
      minAgentConsensus: config.minAgentConsensus,
      highVarConfFloor: config.highVarConfFloor,
      marketEdgeThresholds: config.marketEdgeThresholds,
      confidenceScaling: config.confidenceScaling,
      variancePenalties: config.variancePenalties,
      agentSignalWeights: config.agentSignalWeights,
      sampleSize,
      calibrationScore,
      notes,
    });

    // Update agent signal performance table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signalAccuracy = computeAgentSignalAccuracy(graded as any);
    for (const sig of signalAccuracy) {
      await db.insert(agentSignalPerformance).values({
        id: nanoid(),
        signalName: sig.signalName,
        signalValue: "pass",
        totalCount: sig.passTotal,
        correctCount: sig.passCorrect,
        accuracyRate: sig.passAccuracy,
        configVersion: nextVersion,
      });

      if (sig.failTotal > 0) {
        await db.insert(agentSignalPerformance).values({
          id: nanoid(),
          signalName: sig.signalName,
          signalValue: "fail",
          totalCount: sig.failTotal,
          correctCount: sig.failCorrect,
          accuracyRate: sig.failAccuracy,
          configVersion: nextVersion,
        });
      }
    }

    return NextResponse.json({
      success: true,
      version: nextVersion,
      sampleSize,
      calibrationScore,
      notes,
    });
  } catch (error) {
    console.error("[Recalibrate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recalibration failed" },
      { status: 500 }
    );
  }
}
