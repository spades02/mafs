"use client"

import { useState } from "react"
import { FightSelector } from "./fight-selector"
import DashboardContent from "./dashboard-content"
import { mockCardData } from "@/lib/data/mock-data"
import { useAnalysisStore } from "@/lib/hooks/useAnalysisStore"

export default function FightAnalysisContent() {
  const [selectedFightIndex, setSelectedFightIndex] = useState<number | null>(null)
const selectedFight = selectedFightIndex !== null ? mockCardData.fights[selectedFightIndex] : null
  const analysisRun = useAnalysisStore((s) => s.analysisRun)

  return (
    <div className="space-y-10">
      {/* Fight Selector */}
      <FightSelector
        selectedFightIndex={selectedFightIndex!}
        setSelectedFightIndex={setSelectedFightIndex}
      />

      {/* Dashboard Content Generated after getting response from agents */}
      {selectedFight && analysisRun && (
        <DashboardContent selectedFight={selectedFight} />
      )}
    </div>
  )
}
