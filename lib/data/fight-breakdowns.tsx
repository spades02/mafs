const fightBreakdowns: Record<
    string,
    {
      fight: string
      edge: string
      ev: string
      score: string
      trueLine: { fighter: string; odds: string; prob: string }
      marketLine: { fighter: string; odds: string; prob: string }
      mispricing: string
      recommendedBet: string
      betEv: string
      confidence: string
      risk: string
      stake: string
      fighter1: { name: string; notes: string[] }
      fighter2: { name: string; notes: string[] }
      pathToVictory: { path: string; prob: string }[]
      whyLineExists: string[]
    }
  > = {
    "fight-1": {
      fight: "Strickland vs Adesanya",
      edge: "Extreme Edge",
      ev: "+28.7%",
      score: "94",
      trueLine: { fighter: "Strickland", odds: "+120", prob: "45.4%" },
      marketLine: { fighter: "Strickland", odds: "+500", prob: "16.7%" },
      mispricing: "+28.7",
      recommendedBet: "Strickland ML +500",
      betEv: "+28.7%",
      confidence: "88%",
      risk: "Medium",
      stake: "2.5",
      fighter1: {
        name: "Sean Strickland",
        notes: [
          "High volume, durable, elite cardio",
          "Relentless forward pressure fighter",
          "Excellent defensive wrestling",
        ],
      },
      fighter2: {
        name: "Israel Adesanya",
        notes: [
          "Counter-striker, needs space to work",
          "Struggles against forward pressure",
          "Reduced output in recent fights",
        ],
      },
      pathToVictory: [
        { path: "Strickland by Decision", prob: "(43%)" },
        { path: "Strickland Late Finish", prob: "(21%)" },
        { path: "Adesanya KO", prob: "(17%)" },
      ],
      whyLineExists: [
        "Market is overrating Adesanya's name value",
        "Books are underpricing Strickland's durability and pace",
        "Style mismatch favors underdog pressure fighter",
        "Recent Adesanya losses distorted public perception",
        "Historical data supports high-pressure fighters vs counter-strikers",
      ],
    },
    "fight-2": {
      fight: "Pantoja vs Erceg",
      edge: "Strong Edge",
      ev: "+21.3%",
      score: "87",
      trueLine: { fighter: "Pantoja ITD", odds: "-250", prob: "71.4%" },
      marketLine: { fighter: "Pantoja ITD", odds: "-150", prob: "60.0%" },
      mispricing: "+21.3",
      recommendedBet: "Pantoja ITD -150",
      betEv: "+21.3%",
      confidence: "82%",
      risk: "Low",
      stake: "3.0",
      fighter1: {
        name: "Alexandre Pantoja",
        notes: [
          "Elite submission game with 14 career subs",
          "Relentless grappling pressure",
          "Championship-level experience and conditioning",
        ],
      },
      fighter2: {
        name: "Steve Erceg",
        notes: [
          "Untested at elite championship level",
          "Suspect submission defense (75% TDD)",
          "Limited experience against top grapplers",
        ],
      },
      pathToVictory: [
        { path: "Pantoja by Submission", prob: "(48%)" },
        { path: "Pantoja TKO Round 3+", prob: "(23%)" },
        { path: "Erceg by Decision", prob: "(15%)" },
      ],
      whyLineExists: [
        "Erceg's striking skills are overvalued by casual bettors",
        "Market underestimating Pantoja's finish rate against non-elite competition",
        "Books shading toward decision due to championship rounds",
        "Grappling mismatch not priced into ITD market",
        "Pantoja's recent performances show increased finishing ability",
      ],
    },
    "fight-3": {
      fight: "Makhachev vs Poirier",
      edge: "Moderate Edge",
      ev: "+18.5%",
      score: "81",
      trueLine: { fighter: "Over 2.5 Rounds", odds: "-120", prob: "54.5%" },
      marketLine: { fighter: "Over 2.5 Rounds", odds: "+120", prob: "45.5%" },
      mispricing: "+18.5",
      recommendedBet: "Over 2.5 Rounds +120",
      betEv: "+18.5%",
      confidence: "76%",
      risk: "Medium",
      stake: "2.0",
      fighter1: {
        name: "Islam Makhachev",
        notes: [
          "Elite grappling but measured pace",
          "Prefers control over finishes",
          "Patient gameplan in recent championship bouts",
        ],
      },
      fighter2: {
        name: "Dustin Poirier",
        notes: [
          "Exceptional durability (never stopped by sub)",
          "Elite submission defense and scrambling",
          "Experience surviving adversity in championship rounds",
        ],
      },
      pathToVictory: [
        { path: "Makhachev by Decision", prob: "(41%)" },
        { path: "Over 2.5 Rounds hit", prob: "(62%)" },
        { path: "Poirier survives to R4+", prob: "(38%)" },
      ],
      whyLineExists: [
        "Public overvaluing Makhachev's finish rate",
        "Poirier's durability and experience underpriced",
        "Recent Makhachev fights show conservative approach",
        "Books following action on early finish props",
        "Historical data shows elite wrestlers vs elite BJJ goes distance",
      ],
    },
    "fight-4": {
      fight: "Oliveira vs Chandler",
      edge: "Mild Edge",
      ev: "+12.1%",
      score: "64",
      trueLine: { fighter: "Oliveira Dec", odds: "+120", prob: "45.5%" },
      marketLine: { fighter: "Oliveira Dec", odds: "+200", prob: "33.3%" },
      mispricing: "+12.1",
      recommendedBet: "Oliveira Dec +200",
      betEv: "+12.1%",
      confidence: "68%",
      risk: "High",
      stake: "1.5",
      fighter1: {
        name: "Charles Oliveira",
        notes: [
          "Slowing down in later rounds recently",
          "Decreased finish rate in last 4 fights",
          "Calculated approach at age 34",
        ],
      },
      fighter2: {
        name: "Michael Chandler",
        notes: [
          "Explosive early but fades late",
          "Vulnerable to submissions when tired",
          "Leaves openings when overcommitting on power shots",
        ],
      },
      pathToVictory: [
        { path: "Oliveira by Decision", prob: "(34%)" },
        { path: "Chandler by KO R1-R2", prob: "(28%)" },
        { path: "Oliveira Late Sub", prob: "(19%)" },
      ],
      whyLineExists: [
        "Market pricing in Oliveira's historical finish rate",
        "Chandler's knockout power is overpriced early",
        "Public perception overlooks Oliveira's patient approach recently",
        "Books following money on early finish props",
        "Age and experience factors not properly weighted",
      ],
    },
    "fight-5": {
      fight: "Holloway vs Gaethje",
      edge: "Minimal Edge",
      ev: "+5.2%",
      score: "52",
      trueLine: { fighter: "Holloway", odds: "-180", prob: "64.3%" },
      marketLine: { fighter: "Holloway", odds: "-165", prob: "62.3%" },
      mispricing: "+5.2",
      recommendedBet: "No Bet",
      betEv: "+5.2%",
      confidence: "54%",
      risk: "Low",
      stake: "0",
      fighter1: {
        name: "Max Holloway",
        notes: [
          "Best boxing volume in the division",
          "Incredible durability and recovery",
          "Strong cardio advantage in later rounds",
        ],
      },
      fighter2: {
        name: "Justin Gaethje",
        notes: [
          "Heavy leg kicks and power punching",
          "Declining durability in recent fights",
          "Less effective when unable to land heavy shots",
        ],
      },
      pathToVictory: [
        { path: "Holloway by Decision", prob: "(52%)" },
        { path: "Gaethje by KO", prob: "(24%)" },
        { path: "Holloway Late TKO", prob: "(16%)" },
      ],
      whyLineExists: [
        "Minimal mispricing - market is efficient here",
        "Both fighters properly valued by books",
        "Recent form accurately reflected in odds",
        "No significant style mismatch to exploit",
        "Pass on this fight - no actionable edge",
      ],
    },
  }