import { useState } from 'react'
import EventRunner from './event-runner'
import BestBets from './best-bets'
import FightTable from './fight-table'
import FightBreakdown from './fight-breakdown'
import AllMarketEdges from './all-market-edges'
import { FightBreakdownType } from '@/types/fight-breakdowns'

export type FightEdgeSummary = {
  id: string;
  fight: string;
  score: number;
  rank: string;
  bet: string;
  ev: string;
  truth: string;
  confidence: string;
  risk: string;
  tier: string;
};


function AnalysisSection() {
const [showResults, setShowResults] = useState(false)
const [fightData, setFightData] = useState<FightEdgeSummary[]>([]);
const [fightBreakdowns, setFightBreakdowns] = useState<FightBreakdownType[]>([]);

  return (
    <>
    <EventRunner setShowResults={setShowResults} setFightData={setFightData} setFightBreakdowns={setFightBreakdowns}/>

    {showResults && (
          <>
            {/* Best Bets on This Card */}
            <BestBets fightData={fightData}/>

            {/* Fight Table */}
            <FightTable fightData={fightData}/>

            {/* Fight Breakdown */}
              <FightBreakdown fightBreakdowns={fightBreakdowns}/>
            {/* All Market Edges */}
            <AllMarketEdges fightData={fightData}/>
          </>
        )}
        </>
  )
}

export default AnalysisSection