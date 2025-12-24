"use client"
import { useState } from 'react'
import EventRunner from '../../event-runner'
import BestBets from '../../best-bets'
import AllMarketEdges from '../../all-market-edges'
import { FightBreakdownType } from '@/types/fight-breakdowns'
import FightAnalysis from './fight-analysis'
import { FightEdgeSummary } from '@/types/fight-edge-summary'

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

            <FightAnalysis fightData={fightData} fightBreakdowns={fightBreakdowns} />
            {/* All Market Edges */}
            <AllMarketEdges fightData={fightData}/>
          </>
        )}
        </>
  )
}

export default AnalysisSection