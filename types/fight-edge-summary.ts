export type FightEdgeSummary = {
  id: number;
  fight: string;

  // New / required by agent
  methodOfVictory: string;
  bet: string;

  // Numeric fields (NOT strings)
  score: number;
  rank: number;
  ev: number | null;
  oddsUnavailable?: boolean;

  truthProbability: number;
  marketProbability: number;

  confidence: number;
  risk: number;

  tier: string;
  recommendedStake: number;

  // AI rationale block
  rationale: {
    title: string;
    sections: {
      marketInefficiencyDetected: string[];
      matchupDrivers: string[];
      dataSignalsAligned: string[];
      riskFactors: string[];
      whyThisLineNotOthers: string[];
    };
    summary: string;
  };
};

export type FightEdgeSummaryWithFightId = FightEdgeSummary & {
  fightId: number;
};
