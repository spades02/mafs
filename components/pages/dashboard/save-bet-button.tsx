"use client"

import { useState, useTransition } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { SimulationBet } from "@/app/(app)/dashboard/d-types"
import { savePlay, unsavePlay } from "@/app/(app)/saved/actions"
import { toast } from "sonner"

interface SaveBetButtonProps {
  bet: SimulationBet
  eventId?: string | null
  eventName?: string | null
  initiallySaved?: boolean
}

export function SaveBetButton({ bet, eventId, eventName, initiallySaved = false }: SaveBetButtonProps) {
  const [saved, setSaved] = useState(initiallySaved)
  const [pulse, setPulse] = useState(false)
  const [, startTransition] = useTransition()

  const handleToggle = () => {
    const nextSaved = !saved
    setSaved(nextSaved)
    setPulse(true)
    window.setTimeout(() => setPulse(false), 280)

    startTransition(async () => {
      const result = nextSaved
        ? await savePlay({
            betId: bet.id,
            eventId: eventId ?? null,
            eventName: eventName ?? null,
            fight: bet.fight ?? null,
            label: bet.label,
            betType: bet.bet_type,
            oddsAmerican: bet.odds_american ?? null,
            pSim: bet.P_sim ?? null,
            pImp: bet.P_imp ?? null,
            edgePct: bet.edge_pct ?? null,
            confidencePct: bet.confidencePct ?? null,
          })
        : await unsavePlay(bet.id)

      if (!result.ok) {
        setSaved(!nextSaved)
        toast.error(
          result.error === "unauthorized"
            ? "Sign in to save plays"
            : "Couldn't update saved plays",
        )
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={saved ? "Unsave play" : "Save play"}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ease-out",
        saved
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-white hover:border-white/20",
        pulse && "scale-110",
      )}
    >
      {saved ? (
        <BookmarkCheck className="w-4 h-4 transition-transform duration-200 ease-out" />
      ) : (
        <Bookmark className="w-4 h-4 transition-transform duration-200 ease-out" />
      )}
    </button>
  )
}
