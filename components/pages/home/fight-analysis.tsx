"use client";

import { useEffect, useState } from "react";
import FightBreakdown from "@/components/fight-breakdown";
import FightTable from "@/components/fight-table";
import { FightEdgeSummary } from "@/types/fight-edge-summary";
import { FightBreakdownType } from "@/types/fight-breakdowns";

type FightAnalysisProps = {
  fightData: FightEdgeSummary[];
  fightBreakdowns: Record<number, FightBreakdownType>;
};

function FightAnalysis({ fightData, fightBreakdowns }: FightAnalysisProps) {
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
      <FightTable fightData={fightData} onSelectFight={setSelectedFightId} />

      {currentFightData ? (
        <FightBreakdown currentFightData={currentFightData} />
      ) : (
        // fallback UI while a breakdown isn't available yet
        <div className="mb-8 p-4 rounded-md bg-muted/50 text-sm text-muted-foreground">
          No breakdown available for the selected fight.
        </div>
      )}
    </>
  );
}

export default FightAnalysis;
