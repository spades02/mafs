export const UNIT_SIZE_DOLLARS = 100
export const STARTING_BANKROLL = 1000

export type EdgePick = {
  id: string
  label: string
  betType: string
  outcome: "win" | "loss" | "push"
  profitUnits: number
  gradedAt: string
  edgePct: number | null
  confidencePct: number | null
  oddsAmerican: number | null
}

export type EdgePerformance = {
  totalGraded: number
  wins: number
  losses: number
  pushes: number
  winRate: number
  profitUnits: number
  profitDollars: number
  unitsRisked: number
  roiPct: number
  avgEdge: number | null
  avgClv: number | null
  unitSizeDollars: number
  startingBankroll: number
  endingBankroll: number
  bankrollReturnPct: number
  profitSeries: Array<{ ts: string; cumulativeUnits: number; cumulativeDollars: number }>
  byConfidence: Array<{ tier: "Low" | "Medium" | "High"; plays: number; winRate: number; profitUnits: number }>
  byEdge: Array<{ bucket: string; plays: number; winRate: number; profitUnits: number }>
  picks: EdgePick[]
}
