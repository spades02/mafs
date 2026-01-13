export type FightBreakdownType = {
  fight: string;
  edge: number;

  ev: number; // ✅ FIXED

  score: number;

  trueLine: {
    fighter: string;
    odds: number;
    prob: number;
  };

  marketLine: {
    fighter: string;
    odds: number;
    prob: number;
  };

  mispricing: number;

  recommendedBet: string;
  betEv: number;

  confidence: number;
  risk: number;
  stake: number;

  fighter1: {
    name: string;
    notes: string[];
  };

  fighter2: {
    name: string;
    notes: string[];
  };

  pathToVictory: {
    path: string;
    prob: number;
  }[];

  whyLineExists: string[];
};
