"use client";

import { useEffect, useState } from "react";
import FightBreakdown from "@/components/fight-breakdown";
import FightTable from "@/components/fight-table";
import { FightEdgeSummary } from "@/types/fight-edge-summary";
import { FightBreakdownType } from "@/types/fight-breakdowns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

type FightAnalysisProps = {
  fightData: FightEdgeSummary[];
  fightBreakdowns: Record<number, FightBreakdownType>;
  isLoading?: boolean;
  isComplete?: boolean;
};

function FightAnalysis({ 
  fightData, 
  fightBreakdowns, 
  isLoading = false,
  isComplete = false 
}: FightAnalysisProps) {
  const [selectedFightId, setSelectedFightId] = useState<number | null>(null);

  // auto-select the top fight (first in fightData) if none selected
  useEffect(() => {
    if (selectedFightId === null && fightData && fightData.length > 0) {
      setSelectedFightId(fightData[0].id);
    }
  }, [fightData, selectedFightId]);

  const currentFightData = selectedFightId !== null ? fightBreakdowns[selectedFightId] ?? null : null;

  return (
    <>
      <FightTable 
        fightData={fightData} 
        onSelectFight={setSelectedFightId}
        isLoading={isLoading}
        isComplete={isComplete}
      />

      {currentFightData ? (
        <FightBreakdown currentFightData={currentFightData} />
      ) : isLoading && !isComplete ? (
        // Show loading skeleton while analyzing
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <div className="mt-6 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground text-center">
              Analyzing fight breakdown...
            </p>
          </CardContent>
        </Card>
      ) : (
        // fallback UI when no breakdown is available
        <div className="mb-8 p-4 rounded-md bg-muted/50 text-sm text-muted-foreground">
          {fightData.length === 0 
            ? "Select an event to begin analysis"
            : "No breakdown available for the selected fight."}
        </div>
      )}
    </>
  );
}

export default FightAnalysis;