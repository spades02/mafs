export interface Agent {
  name: string
  lean: string
  probability: number
  notes: string
}

export interface PropPrediction {
  prop: string
  confidence: number
  reason: string
}

export interface BestOutcome {
  market: string
  selection: string
  model_prob: number
  market_implied: number
  edge_pts: number
  ev_percent: number
  stake_percent: number
  confidence: number
  rationale: string
}

export interface Consistency {
  schema_valid: string
  logical_checks: string[]
}

export interface Fight {
  matchup: string
  pick: string
  confidence: number
  path: string
  alt_lean: string | null
  risk_flags: string[]
  volatility: "Low" | "Medium" | "High"
  prop_predictions: PropPrediction[]
  best_outcomes: BestOutcome[]
  no_bet: boolean
  no_bet_reasons: string[]
  __agents__: Agent[]
  __consistency__: Consistency
  __odds_series__: number[]
}

export interface CardSummary {
  most_confident: string
  live_dogs: number
  pass_spots: number
  overall_risk: string
}

export interface CardData {
  event: string
  fights: Fight[]
  card_summary: CardSummary
}

export const mockCardData: CardData = {
  event: "UFC 300: Pereira vs. Hill",
  card_summary: {
    most_confident: "Jones by Decision",
    live_dogs: 3,
    pass_spots: 2,
    overall_risk: "Moderate",
  },
  fights: [
    {
      matchup: "Alex Pereira vs. Jamahal Hill",
      pick: "Pereira",
      confidence: 78,
      path: "KO/TKO",
      alt_lean: "Under 2.5 rounds",
      risk_flags: ["Heavy favorite", "Recency bias in odds"],
      volatility: "Medium",
      no_bet: false,
      no_bet_reasons: [],
      prop_predictions: [
        { prop: "Pereira by KO/TKO", confidence: 72, reason: "Superior striking power" },
        { prop: "Under 2.5 rounds", confidence: 68, reason: "Both fighters finish fights early" },
        { prop: "Fight ends in Round 1", confidence: 45, reason: "Pereira early aggression" },
      ],
      best_outcomes: [
        {
          market: "Moneyline",
          selection: "Pereira",
          model_prob: 78,
          market_implied: 72,
          edge_pts: 6,
          ev_percent: 3.2,
          stake_percent: 2.5,
          confidence: 78,
          rationale: "Significant striking advantage and power differential",
        },
        {
          market: "Method",
          selection: "Pereira by KO/TKO",
          model_prob: 72,
          market_implied: 65,
          edge_pts: 7,
          ev_percent: 4.1,
          stake_percent: 3.0,
          confidence: 72,
          rationale: "Historical finish rate and striking metrics favor early finish",
        },
      ],
      __agents__: [
        {
          name: "Tape Study",
          lean: "Pereira",
          probability: 75,
          notes: "Crisp striking, excellent distance management",
        },
        {
          name: "Stats & Trends",
          lean: "Pereira",
          probability: 80,
          notes: "85% finish rate, 5.2 strikes/min landed",
        },
        {
          name: "News / Weigh-ins",
          lean: "Pereira",
          probability: 72,
          notes: "Clean weight cut, confident demeanor",
        },
        {
          name: "Style Matchup",
          lean: "Pereira",
          probability: 82,
          notes: "Kickboxing base counters Hills boxing-heavy style",
        },
        {
          name: "Market / Odds",
          lean: "Pereira",
          probability: 72,
          notes: "Line movement toward Pereira, sharp money detected",
        },
        {
          name: "Judge / Fuser",
          lean: "Pereira",
          probability: 78,
          notes: "Weighted consensus from all input agents",
        },
        {
          name: "Risk / Volatility",
          lean: "Medium Risk",
          probability: 78,
          notes: "Moderate volatility due to heavy favorite status",
        },
        {
          name: "Consistency Checker",
          lean: "Pass",
          probability: 100,
          notes: "All checks passed, no logical conflicts",
        },
        {
          name: "Referee / Second Opinion",
          lean: "Pereira",
          probability: 76,
          notes: "Agrees with Judge assessment, minor probability adjustment",
        },
        {
          name: "Outcome Optimizer",
          lean: "Pereira ML + Method",
          probability: 78,
          notes: "EV positive on both ML and KO method markets",
        },
      ],
      __consistency__: {
        schema_valid: "All required fields present and correctly typed",
        logical_checks: [
          "Confidence aligns with agent probabilities",
          "Risk flags properly categorized",
          "No conflicting agent recommendations",
        ],
      },
      __odds_series__: [165, 168, 172, 175, 180, 178, 182, 185, 188, 190, 192, 195],
    },
    {
      matchup: "Zhang Weili vs. Yan Xiaonan",
      pick: "Zhang Weili",
      confidence: 82,
      path: "Decision",
      alt_lean: null,
      risk_flags: [],
      volatility: "Low",
      no_bet: false,
      no_bet_reasons: [],
      prop_predictions: [
        { prop: "Zhang by Decision", confidence: 75, reason: "Superior grappling and cardio" },
        { prop: "Over 2.5 rounds", confidence: 85, reason: "Both durable fighters" },
      ],
      best_outcomes: [
        {
          market: "Moneyline",
          selection: "Zhang Weili",
          model_prob: 82,
          market_implied: 75,
          edge_pts: 7,
          ev_percent: 4.5,
          stake_percent: 3.5,
          confidence: 82,
          rationale: "Clear skill advantage across all facets of MMA",
        },
      ],
      __agents__: [
        {
          name: "Tape Study",
          lean: "Zhang",
          probability: 85,
          notes: "More technical striking and better wrestling",
        },
        {
          name: "Stats & Trends",
          lean: "Zhang",
          probability: 80,
          notes: "Higher significant strikes rate, better takedown defense",
        },
        {
          name: "News / Weigh-ins",
          lean: "Zhang",
          probability: 78,
          notes: "Both made weight professionally",
        },
        {
          name: "Style Matchup",
          lean: "Zhang",
          probability: 83,
          notes: "Well-rounded game vs striker-heavy opponent",
        },
        {
          name: "Market / Odds",
          lean: "Zhang",
          probability: 80,
          notes: "Stable line with balanced action",
        },
        {
          name: "Judge / Fuser",
          lean: "Zhang",
          probability: 82,
          notes: "High confidence across all agents",
        },
        {
          name: "Risk / Volatility",
          lean: "Low Risk",
          probability: 82,
          notes: "Low volatility, clear skill differential",
        },
        {
          name: "Consistency Checker",
          lean: "Pass",
          probability: 100,
          notes: "All validations passed",
        },
        {
          name: "Referee / Second Opinion",
          lean: "Zhang",
          probability: 81,
          notes: "Confirms Judge analysis",
        },
        {
          name: "Outcome Optimizer",
          lean: "Zhang ML",
          probability: 82,
          notes: "Strong EV on moneyline",
        },
      ],
      __consistency__: {
        schema_valid: "Valid",
        logical_checks: ["All checks passed", "High confidence alignment"],
      },
      __odds_series__: [140, 142, 145, 143, 145, 148, 150, 148, 150, 152, 150, 148],
    },
    {
      matchup: "Max Holloway vs. Justin Gaethje",
      pick: "Pass",
      confidence: 0,
      path: "N/A",
      alt_lean: "Over 3.5 rounds if pressed",
      risk_flags: ["Too close to call", "High variance fight", "Conflicting agent signals"],
      volatility: "High",
      no_bet: true,
      no_bet_reasons: [
        "Agents split 50/50 on outcome",
        "High variance brawler vs technical fighter",
        "No clear edge in any market",
        "Volatility exceeds risk tolerance",
      ],
      prop_predictions: [{ prop: "Fight goes the distance", confidence: 55, reason: "Both have good chins" }],
      best_outcomes: [],
      __agents__: [
        { name: "Tape Study", lean: "Holloway", probability: 52, notes: "Volume striking favors Max" },
        { name: "Stats & Trends", lean: "Gaethje", probability: 51, notes: "Power punching advantage" },
        { name: "News / Weigh-ins", lean: "Neutral", probability: 50, notes: "No clear advantage" },
        { name: "Style Matchup", lean: "Holloway", probability: 53, notes: "Technical boxing slight edge" },
        { name: "Market / Odds", lean: "Pick Em", probability: 50, notes: "Dead even market pricing" },
        { name: "Judge / Fuser", lean: "Pass", probability: 50, notes: "No consensus reached" },
        { name: "Risk / Volatility", lean: "High Risk", probability: 50, notes: "Extreme volatility detected" },
        { name: "Consistency Checker", lean: "Pass", probability: 100, notes: "Schema valid but no pick" },
        {
          name: "Referee / Second Opinion",
          lean: "Pass",
          probability: 50,
          notes: "Concurs with no-bet decision",
        },
        {
          name: "Outcome Optimizer",
          lean: "No Bet",
          probability: 0,
          notes: "No edge detected in any market",
        },
      ],
      __consistency__: {
        schema_valid: "Valid",
        logical_checks: ["No bet properly flagged", "Risk flags accurate"],
      },
      __odds_series__: [100, 102, 98, 100, 105, 98, 100, 95, 100, 102, 100, 98],
    },
  ],
}
