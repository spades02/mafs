"use client"
import { useState } from "react";
import EventRunner from "../../event-runner";
import BestBets from "../../best-bets";
import AllMarketEdges from "../../all-market-edges";
import FightAnalysis from "./fight-analysis";
import { FightEdgeSummary } from "@/types/fight-edge-summary";
import { FightBreakdownType } from "@/types/fight-breakdowns";
import { useStreamingAnalysis } from '@/lib/hooks/use-streaming-analysis';

function AnalysisSection() {
  const { results, isLoading, isComplete, error, startAnalysis, reset } = useStreamingAnalysis();

  const [showResults, setShowResults] = useState(false);

  // Derive fightData and fightBreakdowns from streaming results
  const fightData: FightEdgeSummary[] = results.map(r => r.edge);
  const fightBreakdowns: Record<number, FightBreakdownType> = results.reduce((acc, r) => {
    acc[r.fightId] = r.breakdown;
    return acc;
  }, {} as Record<number, FightBreakdownType>);

  // Show results when loading starts or we have results
  const shouldShowResults = showResults || isLoading || results.length > 0;

  return (
    <>
      <EventRunner
        setShowResults={setShowResults}
        startAnalysis={startAnalysis}
        isLoading={isLoading}
        isComplete={isComplete}
        error={error}
        reset={reset}
      />

      {shouldShowResults && (
        <>
          <BestBets 
            fightData={fightData}
            isLoading={isLoading}
            isComplete={isComplete}
          />

          <FightAnalysis 
            fightData={fightData} 
            fightBreakdowns={fightBreakdowns}
            isLoading={isLoading}
            isComplete={isComplete}
          />

          <AllMarketEdges 
            fightData={fightData}
            isLoading={isLoading}
            isComplete={isComplete}
          />
        </>
      )}
    </>
  );
}

export default AnalysisSection;