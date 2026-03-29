import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  predictionLogs,
  predictionOutcomes,
  fightSettlements,
  fights,
} from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  determineOutcome,
  computeClosingOdds,
  computeProfitUnits,
} from "@/lib/calibration/grade-prediction";
import { oddsToProb } from "@/lib/odds/utils";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find prediction_logs that have a settlement but no outcome yet
    const ungraded = await db
      .select({
        prediction: predictionLogs,
        settlement: fightSettlements,
        fight: fights,
      })
      .from(predictionLogs)
      .innerJoin(
        fightSettlements,
        eq(predictionLogs.fightId, fightSettlements.fightId)
      )
      .innerJoin(fights, eq(predictionLogs.fightId, fights.id))
      .leftJoin(
        predictionOutcomes,
        eq(predictionLogs.id, predictionOutcomes.predictionLogId)
      )
      .where(isNull(predictionOutcomes.id));

    let gradedCount = 0;

    for (const row of ungraded) {
      const { prediction, settlement, fight } = row;

      const outcome = determineOutcome(prediction, settlement, fight);

      const closingOdds = computeClosingOdds(prediction, settlement, fight);
      const closingProb = closingOdds ? oddsToProb(closingOdds) : null;
      const clv =
        closingProb !== null ? prediction.modelProb - closingProb : null;

      const bettingOdds = closingOdds ?? prediction.oddsAmerican;
      const profitUnits = computeProfitUnits(outcome, bettingOdds);

      await db.insert(predictionOutcomes).values({
        id: nanoid(),
        predictionLogId: prediction.id,
        fightSettlementId: settlement.id,
        outcome,
        closingOdds,
        closingProb,
        clv,
        profitUnits,
      });

      gradedCount++;
    }

    return NextResponse.json({ success: true, graded: gradedCount });
  } catch (error) {
    console.error("[Grade] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Grading failed" },
      { status: 500 }
    );
  }
}
