"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatOdds } from "@/lib/odds/utils"
import { unsavePlay, setFavorite } from "@/app/(app)/saved/actions"
import { toast } from "sonner"
import { ConfidenceRing } from "@/components/premium-metrics"
import type { SavedPlay } from "@/db/schema/saved-plays-schema"

interface SavedPlayCardProps {
  play: SavedPlay
}

const PROP_BET_TYPES = new Set(["ITD", "GTD", "DGTD", "Over", "Under", "MOV", "Round", "Double Chance", "Prop"])

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return "Just played"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function SavedPlayCard({ play }: SavedPlayCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [favorite, setFavoriteState] = useState<boolean>(play.isFavorite ?? false)
  const [favBurst, setFavBurst] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [isFavPending, startFavTransition] = useTransition()

  const handleRemove = () => {
    if (isRemoving) return
    setIsRemoving(true)
    // Animate out, then unmount after the transition; fire DB write in parallel
    window.setTimeout(() => setIsHidden(true), 220)
    startTransition(async () => {
      const res = await unsavePlay(play.betId)
      if (!res.ok) {
        setIsRemoving(false)
        setIsHidden(false)
        toast.error("Couldn't remove play")
      }
    })
  }

  const handleToggleFavorite = () => {
    const next = !favorite
    setFavoriteState(next)
    if (next) {
      // Trigger pop+burst animation only when adding to favorites
      setFavBurst((n) => n + 1)
    }
    startFavTransition(async () => {
      const res = await setFavorite(play.betId, next)
      if (!res.ok) {
        setFavoriteState(!next)
        toast.error("Couldn't update favorite")
      }
    })
  }

  if (isHidden) return null

  const edge = play.edgePct ?? 0
  const conf = play.confidencePct ?? 0
  const pSim = play.pSim ?? 0
  const pImp = play.pImp ?? 0
  const isProp = PROP_BET_TYPES.has(play.betType)
  const variance: "high" | "moderate" | "low" =
    edge >= 5 && conf >= 70 ? "high" : edge >= 2 ? "moderate" : "low"
  const varianceLabel = variance === "high" ? "High" : variance === "moderate" ? "Moderate" : "Low"
  const varianceClass =
    variance === "high"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : variance === "moderate"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
      : "bg-white/5 text-muted-foreground border-white/10"

  const aiInsight =
    pImp > 0
      ? `${play.label} — ${(pSim * 100).toFixed(0)}% model probability vs implied ${(pImp * 100).toFixed(1)}%.`
      : `${play.label} — ${(pSim * 100).toFixed(0)}% model probability identified by MAFS engine.`

  const oddsDisplay = play.oddsAmerican ? formatOdds(play.oddsAmerican, "american") : "—"
  const marketImpliedPct = pImp > 0 ? `${(pImp * 100).toFixed(0)}%` : null

  return (
    <Card
      className={cn(
        "border border-white/5 bg-[#0A0C10] overflow-hidden hover:border-primary/20 transition-all duration-200 ease-out",
        isRemoving && "opacity-0 scale-95 pointer-events-none",
      )}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white leading-tight truncate">{play.label}</h3>
            {(play.fight || play.eventName) && (
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
                {play.fight || play.eventName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorite}
              aria-busy={isFavPending}
              className={cn(
                "relative inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors overflow-visible",
                favorite
                  ? "text-amber-400 hover:bg-amber-400/10"
                  : "text-muted-foreground/60 hover:text-amber-400 hover:bg-amber-400/10",
              )}
            >
              {favBurst > 0 && favorite && (
                <span
                  key={`burst-${favBurst}`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border-2 border-amber-400/70 pointer-events-none animate-fav-burst"
                />
              )}
              {isFavPending && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-transparent border-t-amber-400/80 border-r-amber-400/40 pointer-events-none animate-spin"
                  style={{ animationDuration: "700ms" }}
                />
              )}
              <Star
                key={`star-${favBurst}-${favorite ? 1 : 0}`}
                className={cn(
                  "relative w-5 h-5",
                  favorite && "fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]",
                  favBurst > 0 && favorite && "animate-fav-pop",
                )}
              />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove saved play"
              aria-busy={isPending}
              className="relative inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              {isPending && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-md border border-transparent border-t-red-400/80 border-r-red-400/40 pointer-events-none animate-spin"
                  style={{ animationDuration: "700ms" }}
                />
              )}
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confidence + Edge + Odds row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col items-center">
            <ConfidenceRing value={conf} size={56} />
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-1.5">Model</p>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Edge</p>
            <p
              className={cn(
                "text-3xl font-bold tabular-nums leading-none",
                edge >= 5 ? "text-emerald-400" : edge >= 2 ? "text-emerald-400/80" : "text-amber-400",
              )}
            >
              {edge > 0 ? "+" : ""}
              {edge.toFixed(1)}%
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-base font-bold text-white tabular-nums">{oddsDisplay}</p>
            {marketImpliedPct && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Market {marketImpliedPct}</p>
            )}
          </div>
        </div>

        {/* AI Insight */}
        <div className="rounded-lg border border-white/5 bg-[#0F1117] p-3 mb-4">
          <p className="text-[9px] uppercase tracking-widest text-primary/80 font-bold mb-1.5">AI Insight</p>
          <p className="text-xs text-white/80 leading-relaxed">{aiInsight}</p>
        </div>

        {/* Tags + timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border",
                isProp
                  ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                  : "bg-white/5 text-muted-foreground border-white/10",
              )}
            >
              {isProp ? "Prop" : play.betType}
            </span>
            <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border", varianceClass)}>
              {varianceLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Clock className="w-3 h-3" />
            <span>{formatRelative(new Date(play.savedAt))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
