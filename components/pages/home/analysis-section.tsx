"use client"
import { useState } from "react";
import EventRunner from "../../event-runner";
import BestBets from "../../best-bets";
import AllMarketEdges from "../../all-market-edges";
import FightAnalysis from "./fight-analysis";
import { FightEdgeSummary } from "@/types/fight-edge-summary";
import { FightBreakdownType } from "@/types/fight-breakdowns";

function AnalysisSection() {
  const [showResults, setShowResults] = useState(false);
  const [fightData, setFightData] = useState<FightEdgeSummary[]>([]);
  // store as a map keyed by number for type-safety and fast lookup
  const [fightBreakdowns, setFightBreakdowns] =
  useState<Record<number, FightBreakdownType>>({});

  return (
    <>
      <EventRunner
        setShowResults={setShowResults}
        setFightData={setFightData}
        setFightBreakdowns={setFightBreakdowns}
      />

      {showResults && (
        <>
          <BestBets fightData={fightData} />

          <FightAnalysis fightData={fightData} fightBreakdowns={fightBreakdowns} />

          <AllMarketEdges fightData={fightData} />
        </>
      )}
    </>
  );
}

export default AnalysisSection;
