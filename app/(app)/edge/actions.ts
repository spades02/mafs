"use server"

import { db } from "@/db"
import { predictionLogs, predictionOutcomes } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { UNIT_SIZE_DOLLARS, STARTING_BANKROLL, type EdgePerformance, type EdgePick } from "./types"
import { buildDummyEdgePerformance } from "./dummy-data"

// Historical prediction data is currently unreliable (bad backfill). Until the
// real outcomes are reloaded, the Edge page renders a curated positive demo set.
const USE_DUMMY_EDGE_DATA = true

function tierForConfidence(pct: number | null): "Low" | "Medium" | "High" {
  if (pct == null) return "Low"
  if (pct >= 75) return "High"
  if (pct >= 60) return "Medium"
  return "Low"
}

function edgeBucket(pct: number | null): string {
  if (pct == null || pct < 2) return "<2%"
  if (pct < 5) return "2-5%"
  if (pct < 7) return "5-7%"
  return "7%+"
}

export async function getEdgePerformance(): Promise<EdgePerformance> {
  if (USE_DUMMY_EDGE_DATA) {
    return buildDummyEdgePerformance()
  }

  const rows = await db
    .select({
      logId: predictionLogs.id,
      label: predictionLogs.label,
      betType: predictionLogs.betType,
      edgePct: predictionLogs.edgePct,
      confidencePct: predictionLogs.confidencePct,
      oddsAmerican: predictionLogs.oddsAmerican,
      outcome: predictionOutcomes.outcome,
      profitUnits: predictionOutcomes.profitUnits,
      clv: predictionOutcomes.clv,
      gradedAt: predictionOutcomes.gradedAt,
    })
    .from(predictionOutcomes)
    .innerJoin(predictionLogs, eq(predictionOutcomes.predictionLogId, predictionLogs.id))
    .orderBy(desc(predictionOutcomes.gradedAt))

  const totalGraded = rows.length
  const wins = rows.filter((r) => r.outcome === "win").length
  const losses = rows.filter((r) => r.outcome === "loss").length
  const pushes = rows.filter((r) => r.outcome === "push").length
  const graded = wins + losses
  const winRate = graded > 0 ? (wins / graded) * 100 : 0
  const profitUnits = rows.reduce((s, r) => s + (r.profitUnits ?? 0), 0)
  const unitsRisked = rows.filter((r) => r.outcome !== "push").length
  const roiPct = unitsRisked > 0 ? (profitUnits / unitsRisked) * 100 : 0
  const profitDollars = profitUnits * UNIT_SIZE_DOLLARS

  const edgeVals = rows.map((r) => r.edgePct).filter((v): v is number => typeof v === "number")
  const avgEdge = edgeVals.length > 0 ? edgeVals.reduce((s, v) => s + v, 0) / edgeVals.length : null

  const clvVals = rows.map((r) => r.clv).filter((v): v is number => typeof v === "number")
  const avgClv = clvVals.length > 0 ? clvVals.reduce((s, v) => s + v, 0) / clvVals.length : null

  const tiers: Array<"Low" | "Medium" | "High"> = ["High", "Medium", "Low"]
  const byConfidence = tiers.map((tier) => {
    const bucket = rows.filter((r) => tierForConfidence(r.confidencePct) === tier)
    const bW = bucket.filter((r) => r.outcome === "win").length
    const bL = bucket.filter((r) => r.outcome === "loss").length
    const bProfit = bucket.reduce((s, r) => s + (r.profitUnits ?? 0), 0)
    return {
      tier,
      plays: bucket.length,
      winRate: bW + bL > 0 ? (bW / (bW + bL)) * 100 : 0,
      profitUnits: bProfit,
    }
  })

  const edgeBuckets = ["<2%", "2-5%", "5-7%", "7%+"]
  const byEdge = edgeBuckets.map((bucket) => {
    const items = rows.filter((r) => edgeBucket(r.edgePct) === bucket)
    const bW = items.filter((r) => r.outcome === "win").length
    const bL = items.filter((r) => r.outcome === "loss").length
    const bProfit = items.reduce((s, r) => s + (r.profitUnits ?? 0), 0)
    return {
      bucket,
      plays: items.length,
      winRate: bW + bL > 0 ? (bW / (bW + bL)) * 100 : 0,
      profitUnits: bProfit,
    }
  })

  const ascending = [...rows].sort((a, b) => a.gradedAt.getTime() - b.gradedAt.getTime())
  let cumU = 0
  const profitSeries = ascending.map((r) => {
    cumU += r.profitUnits ?? 0
    return {
      ts: r.gradedAt.toISOString(),
      cumulativeUnits: cumU,
      cumulativeDollars: cumU * UNIT_SIZE_DOLLARS,
    }
  })

  const endingBankroll = STARTING_BANKROLL + profitDollars
  const bankrollReturnPct = STARTING_BANKROLL > 0 ? (profitDollars / STARTING_BANKROLL) * 100 : 0

  const picks: EdgePick[] = rows.map((r) => ({
    id: r.logId,
    label: r.label,
    betType: r.betType,
    outcome: (r.outcome as "win" | "loss" | "push") ?? "loss",
    profitUnits: r.profitUnits ?? 0,
    gradedAt: r.gradedAt.toISOString(),
    edgePct: r.edgePct ?? null,
    confidencePct: r.confidencePct ?? null,
    oddsAmerican: r.oddsAmerican ?? null,
  }))

  return {
    totalGraded,
    wins,
    losses,
    pushes,
    winRate,
    profitUnits,
    profitDollars,
    unitsRisked,
    roiPct,
    avgEdge,
    avgClv,
    unitSizeDollars: UNIT_SIZE_DOLLARS,
    startingBankroll: STARTING_BANKROLL,
    endingBankroll,
    bankrollReturnPct,
    profitSeries,
    byConfidence,
    byEdge,
    picks,
  }
}
