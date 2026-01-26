

export type SimulationBet = {
    id: string
    bet_type: string
    label: string
    odds_american: string
    P_sim: number
    P_imp: number
    edge_pct: number
    stability_score: number
    confidence_label: "Low" | "Medium" | "High"
    confidencePct: number
    varianceTag: "low" | "medium" | "high"
    reason: string
    detailedReason: {
        marketInefficiency: string
        keyDrivers: string[]
        riskFactors: string[]
    }
    agentSignals: Array<{ name: string; signal: "pass" | "neutral" | "fail"; desc: string }>
    // Intelligence breakdown fields
    patternInsight?: string
    patternMechanics?: string[]
    marketThesis?: string
    // Computed fields
    status?: "qualified" | "filtered"
    rejectReasons?: string[]
    verdict?: string
    edgeSource?: string
    historicalValidation?: string
    executiveSummary?: string
    whySummary?: string
}

export type Fight = {
    id: string
    matchup: string
    odds: string
}

export type BestBet = {
    rank: string
    bet: string
    ev: string
    confidence: string
    tier: string
    isTopCard: boolean
    reasoning: {
        marketInefficiency: string[]
        matchupDrivers: string[]
        dataSignals: string[]
        riskFactors: string[]
        whyThisLine: string[]
        confidenceSummary: string
    }
}

export type SystemParlay = {
    legs: number
    confidence: string
    correlation: string
    expectedReturn: string
    worstCase: string
    hitProbability: string
    bets: Array<{
        market: string
        fight: string
        tag: string
    }>
    explanation: string
}

export type FightBreakdown = {
    trueLine: string
    marketLine: string
    mispricing: string
    bet: string
    ev: string
    confidence: string
    risk: string
    stake: string
    fighter1Name: string
    fighter2Name: string
    fighter1Notes: string
    fighter2Notes: string
    pathToVictory: string
    marketAnalysis: string
    varianceReason?: string
    primaryRisk?: string
}

export type EventData = {
    name: string
    date: string
    location: string
    fights: Fight[]
    simulationBets: SimulationBet[]
    bestBets: BestBet[]
    systemParlays: SystemParlay[]
    fightBreakdowns: Record<string, FightBreakdown>
}
