export type FightBreakdownType = {
    fight: string;
    edge: string;
    ev: string;
    score: string;
    trueLine: { fighter: string; odds: string; prob: string };
    marketLine: { fighter: string; odds: string; prob: string };
    mispricing: string;
    recommendedBet: string;
    betEv: string;
    confidence: string;
    risk: string;
    stake: string;
    fighter1: { name: string; notes: string[] };
    fighter2: { name: string; notes: string[] };
    pathToVictory: { path: string; prob: string }[];
    whyLineExists: string[];
  };
  
  export type FightBreakdowns = Record<string, FightBreakdownType>;
  