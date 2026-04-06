import { db } from "@/db";
import { predictionLogs } from "@/db/schema";
import { nanoid } from "nanoid";
import { FightResult } from "@/app/ai/agents/agents";

export async function logPredictions(
  analysisRunId: string | null,
  eventId: string,
  results: FightResult[],
  source: "live" | "backfill" = "live"
) {
  const rows = results.map((r) => {
    const edge = r.edge;

    // Parse numeric odds — edge.odds_american is a formatted string like "+140", "-200",
    // or "No odds available". Strip non-numeric chars except leading minus sign.
    let oddsNum: number | null = null;
    if (edge.odds_american && edge.odds_american !== "No odds available") {
      const parsed = parseInt(edge.odds_american.replace(/[^0-9-]/g, ""), 10);
      if (!isNaN(parsed) && parsed !== 0) oddsNum = parsed;
    }

    return {
      id: nanoid(),
      analysisRunId,
      eventId,
      fightId: r.fightId,
      fighterId: edge.fighterId ?? null,
      betType: edge.bet_type,
      label: edge.label,
      modelProb: edge.truthProbability ?? edge.P_sim ?? 0,
      marketProb: edge.P_imp ?? null,
      edgePct: edge.edge_pct ?? null,
      confidencePct: edge.confidencePct ?? null,
      stabilityScore: edge.stability_score ?? null,
      varianceTag: edge.varianceTag ?? null,
      oddsAmerican: oddsNum,
      status: edge.status ?? null,
      agentSignals: edge.agentSignals ?? null,
      marketEvals: edge.marketEvaluations ?? null,
      source,
    };
  });

  if (rows.length > 0) {
    await db.insert(predictionLogs).values(rows);
  }
}
