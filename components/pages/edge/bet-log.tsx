"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { formatOdds } from "@/lib/odds/utils"
import type { EdgePick } from "@/app/(app)/edge/types"

type FilterKey = "all" | "winning" | "losing" | "recent"

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "winning", label: "Winning" },
  { key: "losing", label: "Losing" },
  { key: "recent", label: "Recent" },
]

function fmtUnits(u: number): string {
  const sign = u >= 0 ? "+" : ""
  return `${sign}${u.toFixed(2)}u`
}

export function BetLog({ picks }: { picks: EdgePick[] }) {
  const [filter, setFilter] = useState<FilterKey>("all")

  const rows = useMemo(() => {
    if (filter === "winning") return picks.filter((p) => p.outcome === "win")
    if (filter === "losing") return picks.filter((p) => p.outcome === "loss")
    if (filter === "recent") return [...picks].slice(0, 25)
    return picks
  }, [picks, filter])

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-white">Bet Log</h2>
        <div className="flex items-center gap-1 rounded-full bg-white/[0.03] border border-white/5 p-1 self-start sm:self-auto">
          {FILTERS.map((f) => {
            const active = f.key === filter
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-white",
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground/70 text-center py-10">No picks match this filter.</p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5 sm:-mx-6 sm:px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground/60 border-b border-white/5">
                <th className="text-left font-medium py-2 pr-3">Fight / Pick</th>
                <th className="text-left font-medium py-2 px-3">Type</th>
                <th className="text-right font-medium py-2 px-3">Odds</th>
                <th className="text-right font-medium py-2 px-3 hidden sm:table-cell">Conf</th>
                <th className="text-right font-medium py-2 px-3 hidden md:table-cell">Edge</th>
                <th className="text-center font-medium py-2 px-3">Outcome</th>
                <th className="text-right font-medium py-2 pl-3">Units</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const odds = p.oddsAmerican != null ? formatOdds(p.oddsAmerican, "american") : "—"
                const profitColor =
                  p.profitUnits > 0 ? "text-emerald-400" : p.profitUnits < 0 ? "text-red-400" : "text-muted-foreground"
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 pr-3 max-w-[260px]">
                      <p className="text-white font-medium truncate">{p.label}</p>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground/80 text-xs">{p.betType}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-white/90">{odds}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-muted-foreground/80 hidden sm:table-cell">
                      {p.confidencePct != null ? `${p.confidencePct.toFixed(0)}%` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-emerald-400/90 hidden md:table-cell">
                      {p.edgePct != null ? `${p.edgePct >= 0 ? "+" : ""}${p.edgePct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold uppercase",
                          p.outcome === "win"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : p.outcome === "loss"
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : "bg-white/5 text-muted-foreground border border-white/10",
                        )}
                        aria-label={p.outcome}
                      >
                        {p.outcome === "win" ? "W" : p.outcome === "loss" ? "L" : "P"}
                      </span>
                    </td>
                    <td className={cn("py-3 pl-3 text-right tabular-nums font-bold", profitColor)}>
                      {fmtUnits(p.profitUnits)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
