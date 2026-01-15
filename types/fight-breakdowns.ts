export type FightBreakdownType = {
  fight: string;
  edge: number;

  ev: number; // ✅ FIXED

  score: number;

  trueLine: {
    fighter: string;
    odds: number | string;
    prob: number | string;
  };

  marketLine: {
    fighter: string;
    odds: number | string;
    prob: number | string;
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
