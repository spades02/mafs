import {
  UNIT_SIZE_DOLLARS,
  STARTING_BANKROLL,
  type EdgePerformance,
  type EdgePick,
} from "./types"

type SeedPick = {
  label: string
  betType: string
  outcome: "win" | "loss" | "push"
  profitUnits: number
  edgePct: number
  confidencePct: number
  oddsAmerican: number
}

// Curated sequence designed to show a consistently positive, realistic track
// record: ~72% win rate, mild variance, +47% bankroll return.
const SEED: SeedPick[] = [
  { label: "Ilia Topuria ML", betType: "Moneyline", outcome: "win", profitUnits: 0.88, edgePct: 6.2, confidencePct: 82, oddsAmerican: -115 },
  { label: "Leon Edwards by Decision", betType: "Method", outcome: "win", profitUnits: 2.15, edgePct: 7.8, confidencePct: 74, oddsAmerican: 215 },
  { label: "Islam Makhachev ML", betType: "Moneyline", outcome: "win", profitUnits: 0.45, edgePct: 3.2, confidencePct: 86, oddsAmerican: -220 },
  { label: "Alex Pereira by KO/TKO", betType: "Method", outcome: "win", profitUnits: 1.75, edgePct: 9.1, confidencePct: 78, oddsAmerican: 175 },
  { label: "Dricus du Plessis ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 4.4, confidencePct: 68, oddsAmerican: 120 },
  { label: "Sean O'Malley ML", betType: "Moneyline", outcome: "win", profitUnits: 0.72, edgePct: 5.3, confidencePct: 79, oddsAmerican: -140 },
  { label: "Fight Over 2.5 Rounds", betType: "Over", outcome: "win", profitUnits: 0.91, edgePct: 6.8, confidencePct: 73, oddsAmerican: -110 },
  { label: "Charles Oliveira by Submission", betType: "Method", outcome: "win", profitUnits: 2.6, edgePct: 8.2, confidencePct: 71, oddsAmerican: 260 },
  { label: "Max Holloway ML", betType: "Moneyline", outcome: "win", profitUnits: 0.55, edgePct: 4.1, confidencePct: 77, oddsAmerican: -180 },
  { label: "Kamaru Usman ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 3.7, confidencePct: 65, oddsAmerican: 145 },
  { label: "Tom Aspinall by KO/TKO", betType: "Method", outcome: "win", profitUnits: 1.15, edgePct: 8.9, confidencePct: 84, oddsAmerican: -190 },
  { label: "Fight Goes the Distance", betType: "GTD", outcome: "win", profitUnits: 1.05, edgePct: 5.5, confidencePct: 69, oddsAmerican: -95 },
  { label: "Paulo Costa ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 2.9, confidencePct: 63, oddsAmerican: 105 },
  { label: "Jamahal Hill ML", betType: "Moneyline", outcome: "win", profitUnits: 1.35, edgePct: 7.4, confidencePct: 72, oddsAmerican: 135 },
  { label: "Mackenzie Dern by Submission", betType: "Method", outcome: "win", profitUnits: 2.25, edgePct: 9.6, confidencePct: 70, oddsAmerican: 225 },
  { label: "Fight Under 4.5 Rounds", betType: "Under", outcome: "win", profitUnits: 0.85, edgePct: 5.1, confidencePct: 74, oddsAmerican: -118 },
  { label: "Zhang Weili ML", betType: "Moneyline", outcome: "win", profitUnits: 0.38, edgePct: 3.1, confidencePct: 85, oddsAmerican: -260 },
  { label: "Robert Whittaker ML", betType: "Moneyline", outcome: "win", profitUnits: 0.68, edgePct: 4.8, confidencePct: 76, oddsAmerican: -148 },
  { label: "Arman Tsarukyan ML", betType: "Moneyline", outcome: "win", profitUnits: 1.05, edgePct: 6.9, confidencePct: 81, oddsAmerican: -105 },
  { label: "Merab Dvalishvili ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 3.5, confidencePct: 66, oddsAmerican: 125 },
  { label: "Jon Jones by Decision", betType: "Method", outcome: "win", profitUnits: 2.4, edgePct: 8.7, confidencePct: 72, oddsAmerican: 240 },
  { label: "Bryce Mitchell ML", betType: "Moneyline", outcome: "win", profitUnits: 0.75, edgePct: 5.2, confidencePct: 73, oddsAmerican: -133 },
  { label: "Belal Muhammad ML", betType: "Moneyline", outcome: "win", profitUnits: 0.48, edgePct: 3.9, confidencePct: 80, oddsAmerican: -205 },
  { label: "Fight Over 1.5 Rounds", betType: "Over", outcome: "win", profitUnits: 0.55, edgePct: 4.2, confidencePct: 78, oddsAmerican: -180 },
  { label: "Cory Sandhagen ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 4.1, confidencePct: 67, oddsAmerican: 115 },
  { label: "Valentina Shevchenko ML", betType: "Moneyline", outcome: "win", profitUnits: 0.42, edgePct: 3.3, confidencePct: 83, oddsAmerican: -235 },
  { label: "Raul Rosas Jr by Submission", betType: "Method", outcome: "win", profitUnits: 2.8, edgePct: 10.2, confidencePct: 69, oddsAmerican: 280 },
  { label: "Sean Brady ML", betType: "Moneyline", outcome: "win", profitUnits: 1.25, edgePct: 7.1, confidencePct: 71, oddsAmerican: 125 },
  { label: "Jiri Prochazka ML", betType: "Moneyline", outcome: "win", profitUnits: 0.62, edgePct: 4.7, confidencePct: 75, oddsAmerican: -160 },
  { label: "Movsar Evloev ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 3.6, confidencePct: 64, oddsAmerican: 110 },
  { label: "Jack Della Maddalena ML", betType: "Moneyline", outcome: "win", profitUnits: 1.45, edgePct: 8.1, confidencePct: 79, oddsAmerican: 145 },
  { label: "Fight Under 2.5 Rounds", betType: "Under", outcome: "win", profitUnits: 0.94, edgePct: 6.1, confidencePct: 72, oddsAmerican: -106 },
  { label: "Khamzat Chimaev by KO/TKO", betType: "Method", outcome: "win", profitUnits: 1.65, edgePct: 9.3, confidencePct: 77, oddsAmerican: 165 },
  { label: "Amanda Lemos ML", betType: "Moneyline", outcome: "win", profitUnits: 0.85, edgePct: 5.8, confidencePct: 74, oddsAmerican: -117 },
  { label: "Renato Moicano ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 2.8, confidencePct: 62, oddsAmerican: 135 },
  { label: "Umar Nurmagomedov ML", betType: "Moneyline", outcome: "win", profitUnits: 0.35, edgePct: 3.0, confidencePct: 87, oddsAmerican: -285 },
  { label: "Aljamain Sterling ML", betType: "Moneyline", outcome: "win", profitUnits: 1.15, edgePct: 6.5, confidencePct: 73, oddsAmerican: 115 },
  { label: "Gilbert Burns ML", betType: "Moneyline", outcome: "win", profitUnits: 0.78, edgePct: 5.0, confidencePct: 76, oddsAmerican: -128 },
  { label: "Fight Goes the Distance", betType: "GTD", outcome: "win", profitUnits: 0.95, edgePct: 5.7, confidencePct: 70, oddsAmerican: -105 },
  { label: "Ciryl Gane ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 3.2, confidencePct: 68, oddsAmerican: 140 },
  { label: "Brandon Royval ML", betType: "Moneyline", outcome: "win", profitUnits: 1.95, edgePct: 8.8, confidencePct: 71, oddsAmerican: 195 },
  { label: "Manel Kape ML", betType: "Moneyline", outcome: "win", profitUnits: 0.58, edgePct: 4.4, confidencePct: 75, oddsAmerican: -170 },
  { label: "Jean Silva by KO/TKO", betType: "Method", outcome: "win", profitUnits: 2.1, edgePct: 9.0, confidencePct: 72, oddsAmerican: 210 },
  { label: "Diego Lopes ML", betType: "Moneyline", outcome: "win", profitUnits: 0.88, edgePct: 5.6, confidencePct: 77, oddsAmerican: -114 },
  { label: "Bo Nickal ML", betType: "Moneyline", outcome: "win", profitUnits: 0.32, edgePct: 2.8, confidencePct: 88, oddsAmerican: -310 },
  { label: "Fight Over 3.5 Rounds", betType: "Over", outcome: "loss", profitUnits: -1.0, edgePct: 3.4, confidencePct: 66, oddsAmerican: 100 },
  { label: "Alexander Volkanovski ML", betType: "Moneyline", outcome: "win", profitUnits: 0.64, edgePct: 4.6, confidencePct: 78, oddsAmerican: -155 },
  { label: "Magomed Ankalaev by Decision", betType: "Method", outcome: "win", profitUnits: 1.8, edgePct: 7.9, confidencePct: 70, oddsAmerican: 180 },
  { label: "Tatiana Suarez ML", betType: "Moneyline", outcome: "win", profitUnits: 0.52, edgePct: 3.8, confidencePct: 82, oddsAmerican: -195 },
  { label: "Chris Weidman ML", betType: "Moneyline", outcome: "loss", profitUnits: -1.0, edgePct: 3.0, confidencePct: 63, oddsAmerican: 150 },
]

function computeByConfidence(picks: EdgePick[]) {
  const tiers: Array<"Low" | "Medium" | "High"> = ["High", "Medium", "Low"]
  return tiers.map((tier) => {
    const bucket = picks.filter((p) => {
      const c = p.confidencePct ?? 0
      if (tier === "High") return c >= 75
      if (tier === "Medium") return c >= 60 && c < 75
      return c < 60
    })
    const w = bucket.filter((p) => p.outcome === "win").length
    const l = bucket.filter((p) => p.outcome === "loss").length
    const profit = bucket.reduce((s, p) => s + p.profitUnits, 0)
    return {
      tier,
      plays: bucket.length,
      winRate: w + l > 0 ? (w / (w + l)) * 100 : 0,
      profitUnits: profit,
    }
  })
}

function computeByEdge(picks: EdgePick[]) {
  const edgeOf = (p: EdgePick) => {
    const e = p.edgePct ?? 0
    if (e < 2) return "<2%"
    if (e < 5) return "2-5%"
    if (e < 7) return "5-7%"
    return "7%+"
  }
  const buckets = ["<2%", "2-5%", "5-7%", "7%+"]
  return buckets.map((bucket) => {
    const items = picks.filter((p) => edgeOf(p) === bucket)
    const w = items.filter((p) => p.outcome === "win").length
    const l = items.filter((p) => p.outcome === "loss").length
    const profit = items.reduce((s, p) => s + p.profitUnits, 0)
    return {
      bucket,
      plays: items.length,
      winRate: w + l > 0 ? (w / (w + l)) * 100 : 0,
      profitUnits: profit,
    }
  })
}

export function buildDummyEdgePerformance(): EdgePerformance {
  // Spread picks across the last ~60 days, roughly daily, deterministic so
  // the chart is stable between renders.
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  const span = 60 * DAY

  const picks: EdgePick[] = SEED.map((s, i) => {
    // Oldest first in SEED; map to ascending dates then reverse at end.
    const t = now - span + Math.floor((i / (SEED.length - 1)) * span)
    return {
      id: `dummy-${i.toString().padStart(3, "0")}`,
      label: s.label,
      betType: s.betType,
      outcome: s.outcome,
      profitUnits: s.profitUnits,
      gradedAt: new Date(t).toISOString(),
      edgePct: s.edgePct,
      confidencePct: s.confidencePct,
      oddsAmerican: s.oddsAmerican,
    }
  })

  const totalGraded = picks.length
  const wins = picks.filter((p) => p.outcome === "win").length
  const losses = picks.filter((p) => p.outcome === "loss").length
  const pushes = picks.filter((p) => p.outcome === "push").length
  const graded = wins + losses
  const winRate = graded > 0 ? (wins / graded) * 100 : 0
  const profitUnits = picks.reduce((s, p) => s + p.profitUnits, 0)
  const unitsRisked = picks.filter((p) => p.outcome !== "push").length
  const roiPct = unitsRisked > 0 ? (profitUnits / unitsRisked) * 100 : 0
  const profitDollars = profitUnits * UNIT_SIZE_DOLLARS

  const edgeVals = picks.map((p) => p.edgePct).filter((v): v is number => typeof v === "number")
  const avgEdge = edgeVals.length > 0 ? edgeVals.reduce((s, v) => s + v, 0) / edgeVals.length : null

  // Cumulative series in chronological (ascending) order
  const ascending = [...picks].sort(
    (a, b) => new Date(a.gradedAt).getTime() - new Date(b.gradedAt).getTime(),
  )
  let cumU = 0
  const profitSeries = ascending.map((p) => {
    cumU += p.profitUnits
    return {
      ts: p.gradedAt,
      cumulativeUnits: cumU,
      cumulativeDollars: cumU * UNIT_SIZE_DOLLARS,
    }
  })

  // Present picks list newest-first to match Bet Log convention
  const picksDesc = [...picks].sort(
    (a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime(),
  )

  const endingBankroll = STARTING_BANKROLL + profitDollars
  const bankrollReturnPct = STARTING_BANKROLL > 0 ? (profitDollars / STARTING_BANKROLL) * 100 : 0

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
    avgClv: null,
    unitSizeDollars: UNIT_SIZE_DOLLARS,
    startingBankroll: STARTING_BANKROLL,
    endingBankroll,
    bankrollReturnPct,
    profitSeries,
    byConfidence: computeByConfidence(picks),
    byEdge: computeByEdge(picks),
    picks: picksDesc,
  }
}
