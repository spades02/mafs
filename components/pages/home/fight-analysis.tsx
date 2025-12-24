"use client";

import { useState } from "react";
import FightBreakdown from "@/components/fight-breakdown";
import FightTable from "@/components/fight-table";
import { FightEdgeSummary } from "@/types/fight-edge-summary";
import { FightBreakdownType } from "@/types/fight-breakdowns";

type FightAnalysisProps = {
  fightData: FightEdgeSummary[];
  fightBreakdowns: FightBreakdownType[];
};

function FightAnalysis({ fightData, fightBreakdowns }: FightAnalysisProps) {
  const [selectedFightId, setSelectedFightId] = useState<string | null>(null);

  return (
    <>
      <FightTable
        fightData={fightData}
        onSelectFight={setSelectedFightId}
      />

      <FightBreakdown
        fightBreakdowns={fightBreakdowns}
        selectedFightId={selectedFightId}
        onClose={() => setSelectedFightId(null)}
      />
    </>
  );
}

export default FightAnalysis;
