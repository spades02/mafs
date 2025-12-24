export type FightEdgeSummary = {
  id: string;
  fight: string;

  // New / required by agent
  methodOfVictory: string;
  bet: string;

  // Numeric fields (NOT strings)
  score: number;
  rank: number;
  ev: number;

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
