"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Sparkles, Target, Zap, AlertTriangle, Lock } from "lucide-react"
import { AnimatedStat, ConfidenceRing, EdgeMeter, VarianceIndicator } from "@/components/premium-metrics"
import { SimulationBet } from "@/app/(app)/dashboard/d-types"
import { cn } from "@/lib/utils"

interface SimulationStatsProps {
    qualifiedBets: SimulationBet[]
    avgConfidence: number
    avgEdge: number
    riskLevel: "Low" | "Medium" | "High"
    simulationKey?: number
}

export function SimulationStats({ qualifiedBets, avgConfidence, avgEdge, riskLevel, simulationKey = 0 }: SimulationStatsProps) {
    const [isRevealed, setIsRevealed] = useState(false)
    const [showCards, setShowCards] = useState(false)

    // Reset and replay animations on mount or re-simulation
    useEffect(() => {
        setIsRevealed(false)
        setShowCards(false)

        const revealTimer = setTimeout(() => setIsRevealed(true), 100)
        const cardsTimer = setTimeout(() => setShowCards(true), 400)

        return () => {
            clearTimeout(revealTimer)
            clearTimeout(cardsTimer)
        }
    }, [simulationKey])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {/* Feature badges + Disclaimer row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {[
                        { icon: Sparkles, label: "10K+ Sims", delay: 0 },
                        { icon: Target, label: "Patterns", delay: 80 },
                        { icon: Zap, label: "Edge", delay: 160 },
                    ].map(({ icon: Icon, label, delay }) => (
                        <div
                            key={label}
                            className={cn(
                                "glass-button px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-500",
                                isRevealed
                                    ? "opacity-100 translate-y-0 scale-100"
                                    : "opacity-0 translate-y-3 scale-90"
                            )}
                            style={{ transitionDelay: `${delay}ms` }}
                        >
                            <Icon className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-medium text-white">{label}</span>
                        </div>
                    ))}
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 transition-all duration-500",
                    isRevealed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                )} style={{ transitionDelay: "250ms" }}>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] text-amber-400/80">Educational Only</span>
                </div>
            </div>

            <Card className={cn(
                "glass-card-intense glass-shimmer border-primary/20 overflow-hidden relative transition-all duration-700",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}>
                {/* Scan-line sweep on entrance */}
                <div className={cn(
                    "absolute inset-0 z-20 pointer-events-none",
                    isRevealed ? "animate-stats-sweep" : "hidden"
                )}>
                    <div className="absolute inset-y-0 w-[2px] bg-linear-to-b from-transparent via-primary/60 to-transparent"
                        style={{ animation: isRevealed ? "stats-scan-line 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none" }} />
                </div>

                <CardContent className="p-6">
                    <div className={cn(
                        "flex items-center gap-3 mb-2 transition-all duration-500",
                        isRevealed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )} style={{ transitionDelay: "200ms" }}>
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Analysis Mode: Active</span>
                        <Lock className="w-4 h-4 text-primary/60" />
                    </div>
                    <p className={cn(
                        "text-xs text-muted-foreground mb-6 transition-all duration-500",
                        isRevealed ? "opacity-100" : "opacity-0"
                    )} style={{ transitionDelay: "350ms" }}>
                        MAFS filters low-confidence scenarios. Only statistically notable outcomes are displayed.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Stat 1: Qualified Scenarios */}
                        <div className={cn(
                            "stat-card-premium transition-all duration-600",
                            showCards ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                        )} style={{ transitionDelay: "0ms" }}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Qualified Scenarios</p>
                            {showCards && <AnimatedStat key={`qs-${simulationKey}`} value={qualifiedBets.length} label="" />}
                            <p className="text-xs text-muted-foreground/60 mt-3">Passed simulation filters</p>
                        </div>

                        {/* Stat 2: Model Confidence */}
                        <div className={cn(
                            "stat-card-premium transition-all duration-600",
                            showCards ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                        )} style={{ transitionDelay: "120ms" }}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Model Confidence</p>
                            <div className="flex justify-center">
                                {showCards && <ConfidenceRing key={`cr-${simulationKey}`} value={avgConfidence} size={56} />}
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-3">Agent agreement score</p>
                        </div>

                        {/* Stat 3: Model Edge */}
                        <div className={cn(
                            "stat-card-premium transition-all duration-600",
                            showCards ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                        )} style={{ transitionDelay: "240ms" }}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Model Edge</p>
                            {showCards && <EdgeMeter key={`em-${simulationKey}`} value={avgEdge} />}
                            <p className="text-xs text-muted-foreground/60 mt-3">vs implied market odds</p>
                        </div>

                        {/* Stat 4: Variance Level */}
                        <div className={cn(
                            "stat-card-premium transition-all duration-600",
                            showCards ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                        )} style={{ transitionDelay: "360ms" }}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Variance Level</p>
                            <div className="flex items-center justify-center gap-3">
                                {showCards && <VarianceIndicator key={`vi-${simulationKey}`} level={riskLevel.toLowerCase() as "low" | "medium" | "high"} />}
                                <span
                                    className={cn(
                                        "text-2xl font-bold transition-all duration-700",
                                        riskLevel === "Low"
                                            ? "text-green-400"
                                            : riskLevel === "Medium"
                                                ? "text-yellow-400"
                                                : "text-red-400",
                                        showCards ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                                    )}
                                    style={{ transitionDelay: "500ms" }}
                                >
                                    {riskLevel}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-3">Outcome uncertainty</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
