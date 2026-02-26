"use client"

import { cn } from "@/lib/utils"
import { Filter, X } from "lucide-react"
import { useState } from "react"

const BET_TYPES = [
    { key: "ALL", label: "All" },
    { key: "ML", label: "ML" },
    { key: "ITD", label: "ITD" },
    { key: "Over", label: "Over" },
    { key: "Under", label: "Under" },
    { key: "MOV", label: "MOV" },
    { key: "Round", label: "Round" },
    { key: "Double Chance", label: "2x" },
] as const

const VARIANCE_OPTIONS = [
    { key: "low", label: "Low", color: "text-green-400 border-green-400/30 bg-green-400/10" },
    { key: "medium", label: "Med", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
    { key: "high", label: "High", color: "text-red-400 border-red-400/30 bg-red-400/10" },
] as const

export type BetFiltersState = {
    betTypes: string[]
    minProbability: number
    varianceLevels: string[]
    minEdge: number
}

interface BetFiltersProps {
    filters: BetFiltersState
    onChange: (filters: BetFiltersState) => void
    totalCount: number
    filteredCount: number
}

export const DEFAULT_FILTERS: BetFiltersState = {
    betTypes: ["ALL"],
    minProbability: 0,
    varianceLevels: ["low", "medium", "high"],
    minEdge: 0,
}

export function BetFilters({ filters, onChange, totalCount, filteredCount }: BetFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const isFiltered = filters.betTypes[0] !== "ALL" ||
        filters.minProbability > 0 ||
        filters.varianceLevels.length < 3 ||
        filters.minEdge > 0

    const handleBetTypeToggle = (key: string) => {
        if (key === "ALL") {
            onChange({ ...filters, betTypes: ["ALL"] })
            return
        }

        let newTypes = filters.betTypes.filter(t => t !== "ALL")

        if (newTypes.includes(key)) {
            newTypes = newTypes.filter(t => t !== key)
        } else {
            newTypes.push(key)
        }

        if (newTypes.length === 0) {
            newTypes = ["ALL"]
        }

        onChange({ ...filters, betTypes: newTypes })
    }

    const handleVarianceToggle = (key: string) => {
        let newLevels = [...filters.varianceLevels]

        if (newLevels.includes(key)) {
            newLevels = newLevels.filter(v => v !== key)
        } else {
            newLevels.push(key)
        }

        if (newLevels.length === 0) {
            newLevels = ["low", "medium", "high"]
        }

        onChange({ ...filters, varianceLevels: newLevels })
    }

    const handleReset = () => {
        onChange(DEFAULT_FILTERS)
    }

    return (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            {/* Compact toggle bar */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300",
                    isExpanded
                        ? "border-primary/30 bg-primary/5"
                        : "border-white/10 bg-black/30 hover:border-white/20"
                )}
            >
                <div className="flex items-center gap-3">
                    <Filter className={cn("w-4 h-4 transition-colors", isExpanded ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm font-medium text-white">Filters</span>
                    {isFiltered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                            {filteredCount}/{totalCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isFiltered && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleReset() }}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                    <svg
                        className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Expanded filter panel */}
            {isExpanded && (
                <div className="mt-3 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Row 1: Bet Type */}
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2.5">Market Type</p>
                        <div className="flex flex-wrap gap-2">
                            {BET_TYPES.map(({ key, label }) => {
                                const isActive = filters.betTypes.includes(key)
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleBetTypeToggle(key)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                                            isActive
                                                ? "bg-primary/20 border-primary/40 text-primary"
                                                : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                                        )}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Row 2: Probability + Edge sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Min Probability */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Min Probability</p>
                                <span className="text-xs font-mono text-primary">{filters.minProbability}%</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={95}
                                step={5}
                                value={filters.minProbability}
                                onChange={(e) => onChange({ ...filters, minProbability: parseInt(e.target.value) })}
                                className="w-full accent-primary h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg
                                    [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                        </div>

                        {/* Min Edge */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Min Edge</p>
                                <span className="text-xs font-mono text-primary">{filters.minEdge}%</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={30}
                                step={1}
                                value={filters.minEdge}
                                onChange={(e) => onChange({ ...filters, minEdge: parseInt(e.target.value) })}
                                className="w-full accent-primary h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg
                                    [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Row 3: Variance */}
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2.5">Variance / Volatility</p>
                        <div className="flex gap-2">
                            {VARIANCE_OPTIONS.map(({ key, label, color }) => {
                                const isActive = filters.varianceLevels.includes(key)
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleVarianceToggle(key)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                                            isActive
                                                ? color
                                                : "bg-white/5 border-white/10 text-muted-foreground/50 hover:border-white/20"
                                        )}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
