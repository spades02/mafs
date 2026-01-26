"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Sparkles, Target, Zap, AlertTriangle, Lock } from "lucide-react"
import { AnimatedStat, ConfidenceRing, EdgeMeter, VarianceIndicator } from "@/components/premium-metrics"
import { SimulationBet } from "@/app/(app)/dashboard/d-types"

interface SimulationStatsProps {
    qualifiedBets: SimulationBet[]
    avgConfidence: number
    avgEdge: number
    riskLevel: "Low" | "Medium" | "High"
}

export function SimulationStats({ qualifiedBets, avgConfidence, avgEdge, riskLevel }: SimulationStatsProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {/* Feature badges + Disclaimer row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="glass-button px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-white">10K+ Sims</span>
                    </div>
                    <div className="glass-button px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-white">Patterns</span>
                    </div>
                    <div className="glass-button px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-white">Edge</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] text-amber-400/80">Educational Only</span>
                </div>
            </div>

            <Card className="glass-card-intense glass-shimmer border-primary/20 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Analysis Mode: Active</span>
                        <Lock className="w-4 h-4 text-primary/60" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">
                        MAFS filters low-confidence scenarios. Only statistically notable outcomes are displayed.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="stat-card-premium stagger-entrance">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Qualified Scenarios</p>
                            <AnimatedStat value={qualifiedBets.length} label="" />
                            <p className="text-xs text-muted-foreground/60 mt-3">Passed simulation filters</p>
                        </div>
                        <div className="stat-card-premium stagger-entrance" style={{ animationDelay: "100ms" }}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Model Confidence</p>
                            <div className="flex justify-center">
                                <ConfidenceRing value={avgConfidence} size={56} />
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-3">Agent agreement score</p>
                        </div>
                        <div className="stat-card-premium stagger-entrance" style={{ animationDelay: "200ms" }}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Model Edge</p>
                            <EdgeMeter value={avgEdge} />
                            <p className="text-xs text-muted-foreground/60 mt-3">vs implied market odds</p>
                        </div>
                        <div className="stat-card-premium stagger-entrance" style={{ animationDelay: "300ms" }}>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Variance Level</p>
                            <div className="flex items-center justify-center gap-3">
                                <VarianceIndicator level={riskLevel.toLowerCase() as "low" | "medium" | "high"} />
                                <span
                                    className={`text-2xl font-bold ${riskLevel === "Low"
                                        ? "text-green-400"
                                        : riskLevel === "Medium"
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                        }`}
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
