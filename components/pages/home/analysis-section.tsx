"use client"
import { useState } from "react";
import EventRunner from "../../event-runner";
import BestBets from "../../best-bets";
import AllMarketEdges from "../../all-market-edges";
import FightAnalysis from "./fight-analysis";
import { FightEdgeSummaryWithFightId } from "@/types/fight-edge-summary";
import { FightBreakdownType } from "@/types/fight-breakdowns";
import { useStreamingAnalysis } from '@/lib/hooks/use-streaming-analysis';
import AnalysisProgress from "@/components/analysis-progress";

function AnalysisSection() {
  const {
    results,
    totalFights,
    isLoading,
    isComplete,
    error,
    startAnalysis,
    reset,
  } = useStreamingAnalysis();
  const [showResults, setShowResults] = useState(false);

  const progress = totalFights > 0 
    ? (results.length / totalFights) * 100 
    : 0;

  // Derive fightData and fightBreakdowns from streaming results
  const fightData: FightEdgeSummaryWithFightId[] = results.map(r => ({
    ...r.edge,
    fightId: r.fightId,
  }));
  
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
      
      {isLoading && (
        <AnalysisProgress
          progress={progress}
          processed={results.length}
          total={totalFights}
          isComplete={isComplete}
        />
      )}

        
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