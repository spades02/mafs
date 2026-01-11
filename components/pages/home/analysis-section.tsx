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
    currentPhase,
    statusMessage,
    oddsProgress,
    startAnalysis,
    reset,
  } = useStreamingAnalysis();
  const [showResults, setShowResults] = useState(false);

  // Calculate progress based on current phase
  let progress = 0;
  let processed = 0;
  
  if (currentPhase === 'fetching_odds') {
    // During odds fetching, use odds progress
    progress = oddsProgress.total > 0 
      ? (oddsProgress.current / oddsProgress.total) * 100 
      : 0;
    processed = oddsProgress.current;
  } else if (currentPhase === 'analyzing_card') {
    // Card analysis is indeterminate, show full bar with pulse
    progress = 100;
    processed = 0;
  } else if (currentPhase === 'analyzing_fight') {
    // During fight analysis, use results count
    progress = totalFights > 0 
      ? (results.length / totalFights) * 100 
      : 0;
    processed = results.length;
  } else {
    // Fallback to results-based progress
    progress = totalFights > 0 
      ? (results.length / totalFights) * 100 
      : 0;
    processed = results.length;
  }

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
          processed={processed}
          total={totalFights}
          isComplete={isComplete}
          currentPhase={currentPhase}
          statusMessage={statusMessage}
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