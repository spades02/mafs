"use client"

import { useMemo, useState } from "react"
import { ArrowDownWideNarrow } from "lucide-react"
import { cn } from "@/lib/utils"
import { SavedPlayCard } from "./saved-play-card"
import type { SavedPlay } from "@/db/schema/saved-plays-schema"

type FilterKey = "all" | "favorites" | "underdogs" | "props" | "overs" | "unders"
type SortKey = "edge" | "confidence" | "recent"

const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All Plays" },
    { key: "favorites", label: "Favorites" },
    { key: "underdogs", label: "Underdogs" },
    { key: "props", label: "Props" },
    { key: "overs", label: "Overs" },
    { key: "unders", label: "Unders" },
]

const SORTS: { key: SortKey; label: string }[] = [
    { key: "edge", label: "Highest Edge" },
    { key: "confidence", label: "Highest Confidence" },
    { key: "recent", label: "Most Recent" },
]

const PROP_BET_TYPES = new Set(["ITD", "GTD", "DGTD", "OVER", "UNDER", "MOV", "ROUND", "DOUBLE CHANCE", "PROP", "SPREAD"])

function normalizeBetType(s: string | null | undefined): string {
    return (s ?? "").trim().toUpperCase()
}

function parseOdds(raw: string | null | undefined): number | null {
    if (!raw) return null
    const cleaned = String(raw).replace(/[+\s]/g, "")
    const n = parseInt(cleaned, 10)
    return Number.isFinite(n) ? n : null
}

function isFavorite(p: SavedPlay): boolean {
    return Boolean(p.isFavorite)
}

function isUnderdog(p: SavedPlay): boolean {
    const n = parseOdds(p.oddsAmerican)
    return n !== null && n > 0
}

function matchesFilter(p: SavedPlay, f: FilterKey): boolean {
    const bt = normalizeBetType(p.betType)
    const label = (p.label ?? "").toLowerCase()

    switch (f) {
        case "all":
            return true
        case "favorites":
            return isFavorite(p)
        case "underdogs":
            return isUnderdog(p)
        case "props":
            return PROP_BET_TYPES.has(bt) || /prop|itd|gtd|dgtd|round|method|over|under/.test(label)
        case "overs":
            return bt === "OVER" || /\bover\b/.test(label)
        case "unders":
            return bt === "UNDER" || /\bunder\b/.test(label)
    }
}

export function SavedPlaysList({ plays }: { plays: SavedPlay[] }) {
    const [activeFilter, setActiveFilter] = useState<FilterKey>("all")
    const [sortKey, setSortKey] = useState<SortKey>("edge")
    const [sortOpen, setSortOpen] = useState(false)

    const filtered = useMemo(() => {
        const base = plays.filter((p) => matchesFilter(p, activeFilter))
        const sorted = [...base].sort((a, b) => {
            if (sortKey === "edge") return (b.edgePct ?? 0) - (a.edgePct ?? 0)
            if (sortKey === "confidence") return (b.confidencePct ?? 0) - (a.confidencePct ?? 0)
            return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        })
        return sorted
    }, [plays, activeFilter, sortKey])

    const activeSort = SORTS.find((s) => s.key === sortKey) ?? SORTS[0]
    const countLabel = `${filtered.length} ${filtered.length === 1 ? "play" : "plays"}`

    return (
        <div>
            {/* Filters + Sort + Count */}
            <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                    {FILTERS.map((f) => {
                        const active = activeFilter === f.key
                        return (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setActiveFilter(f.key)}
                                className={cn(
                                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                    active
                                        ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                                        : "bg-white/[0.03] text-muted-foreground border border-white/5 hover:text-white hover:border-white/10",
                                )}
                            >
                                {f.label}
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setSortOpen((v) => !v)}
                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-medium text-white hover:border-white/20 transition-colors"
                        >
                            <ArrowDownWideNarrow className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{activeSort.label}</span>
                        </button>
                        {sortOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                                <div className="absolute right-0 mt-2 z-20 w-48 rounded-lg border border-white/10 bg-[#0b0f14] shadow-xl overflow-hidden">
                                    {SORTS.map((s) => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => { setSortKey(s.key); setSortOpen(false) }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs transition-colors",
                                                sortKey === s.key
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-white/5 hover:text-white",
                                            )}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground/70 whitespace-nowrap">{countLabel}</p>
                </div>
            </div>

            {/* Cards grid */}
            {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground/70 text-center py-12">No plays match this filter.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((play) => (
                        <SavedPlayCard key={play.id} play={play} />
                    ))}
                </div>
            )}
        </div>
    )
}
