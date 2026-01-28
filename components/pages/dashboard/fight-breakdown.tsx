"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, AlertTriangle, TrendingUp, Activity, BarChart3, Target } from "lucide-react"
import { FightBreakdown as FightBreakdownType } from "@/app/(app)/dashboard/d-types"

interface FightBreakdownProps {
    breakdown: FightBreakdownType
    onClose: () => void
}

export function FightBreakdown({ breakdown, onClose }: FightBreakdownProps) {
    return (
        <section className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Card className="glass-card-intense glass-glow overflow-hidden border-white/5 bg-black/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                    <CardTitle className="text-lg font-medium text-white tracking-wide">Fight Breakdown</CardTitle>
                    <button
                        onClick={onClose}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                    >
                        Close
                    </button>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    {/* SYSTEM SUMMARY */}
                    <div className="p-5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" />
                            System Summary
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            <span className="text-emerald-100 font-medium">Model bias favors <span className="text-emerald-400">{breakdown.fighter1Name}</span>.</span>{" "}
                            {breakdown.fighter1Notes}. {breakdown.fighter2Name}'s path requires {breakdown.fighter2Notes?.toLowerCase() || "a specific strategy"}.
                        </p>
                    </div>

                    {/* MAIN METRICS GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-2">
                        {/* True Line */}
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">True Line</p>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-gray-400">{breakdown.fighter1Name}</span>
                                    <span className="font-mono text-sm font-bold text-white">{breakdown.trueLine?.split(" / ")[0] || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-gray-400">{breakdown.fighter2Name}</span>
                                    <span className="font-mono text-sm font-bold text-white">{breakdown.trueLine?.split(" / ")[1] || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Market Line */}
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Market Line</p>
                            {breakdown.marketLine?.includes("/") ? (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-gray-400">{breakdown.fighter1Name}</span>
                                        <span className="font-mono text-sm font-bold text-white">{breakdown.marketLine.split(" / ")[0]}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-gray-400">{breakdown.fighter2Name}</span>
                                        <span className="font-mono text-sm font-bold text-white">{breakdown.marketLine.split(" / ")[1]}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic pt-1">{breakdown.marketLine || "No odds available"}</p>
                            )}
                        </div>

                        {/* Mispricing */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mispricing</p>
                            <p className={`text-2xl font-bold tracking-tight ${breakdown.mispricing?.includes("-") ? "text-emerald-400" : "text-emerald-400"}`}>
                                {breakdown.mispricing || "0%"}
                            </p>
                        </div>

                        {/* Expected Value */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Expected Value</p>
                            <p className={`text-2xl font-bold tracking-tight ${Number.parseFloat(breakdown.ev?.replace(/[+%]/g, "") || "0") >= 10 ? "text-neon-green glow-text" : "text-emerald-500"}`}>
                                {breakdown.ev || "0%"}
                            </p>
                        </div>
                    </div>

                    {/* FIGHTER PROFILES */}
                    <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-6">
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                                {breakdown.fighter1Name} Profile
                            </p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {breakdown.fighter1Profile || breakdown.fighter1Notes || "No profile available."}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                                {breakdown.fighter2Name} Profile
                            </p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {breakdown.fighter2Profile || breakdown.fighter2Notes || "No profile available."}
                            </p>
                        </div>
                    </div>

                    {/* OUTCOME DISTRIBUTION */}
                    <div className="space-y-3 pt-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Outcome Distribution</p>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                            <p className="font-mono text-sm text-gray-300">
                                {breakdown.outcomeDistribution || breakdown.pathToVictory?.replace(/\|/g, " | ") || "Calculating distribution..."}
                            </p>
                        </div>
                    </div>

                    {/* MARKET PSYCHOLOGY */}
                    <div className="space-y-3 pt-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Market Psychology</p>
                        <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-emerald-500/20 pl-4 py-1">
                            "{Array.isArray(breakdown.marketAnalysis) ? breakdown.marketAnalysis.join(" ") : breakdown.marketAnalysis}"
                        </p>
                    </div>

                    {/* MODEL METADATA BAR */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-5 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="md:col-span-1 space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Model-Leaning Outcome</p>
                            <p className="text-sm font-bold text-white max-w-[140px] truncate" title={breakdown.modelLeaningOutcome || breakdown.bet}>
                                {breakdown.modelLeaningOutcome || breakdown.bet || "Analyzing..."}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Playable Up To</p>
                            <p className="text-sm font-bold text-emerald-400">
                                {breakdown.playableUpTo || "Wait"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Model Confidence</p>
                            <p className="text-xl font-bold text-white">
                                {breakdown.modelConfidence || breakdown.confidence || "N/A"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Agent agreement + matchup similarity</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Variance</p>
                            <p className="text-sm font-medium text-gray-300">
                                {breakdown.variance?.split("(")[0] || "Medium"} <span className="text-muted-foreground text-xs">{breakdown.variance?.includes("(") ? `(${breakdown.variance.split("(")[1]}` : ""}</span>
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Signal Strength</p>
                            <p className="text-sm font-bold text-white">
                                {breakdown.signalStrength || "Moderate"}
                            </p>
                        </div>
                    </div>

                    {/* PRIMARY RISK */}
                    <div className="rounded-lg bg-amber-950/20 border border-amber-500/20 p-4 mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            Primary Risk
                        </p>
                        <p className="text-sm text-amber-200/80">
                            {breakdown.primaryRisk || breakdown.varianceReason || "Standard market risk applies."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
