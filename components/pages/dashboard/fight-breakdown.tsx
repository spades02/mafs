"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, AlertTriangle, TrendingUp } from "lucide-react"
import { FightBreakdown as FightBreakdownType } from "@/app/(app)/dashboard/d-types"
import { LineMovementChart } from "./line-movement-chart"

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
                    <div className="p-5 rounded-xl bg-emerald-500/3 border border-emerald-500/10">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" />
                            System Summary
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {(() => {
                                const f2Name = breakdown.fighter2Name || ""
                                const f2LastName = f2Name.split(" ").pop()?.toLowerCase() || ""
                                const outcome = breakdown.modelLeaningOutcome?.toLowerCase() || ""
                                const favorsF2 = f2LastName && outcome.includes(f2LastName)

                                if (favorsF2) {
                                    return (
                                        <>
                                            <span className="text-emerald-100 font-medium">
                                                Model bias favors <span className="text-emerald-400">{breakdown.fighter2Name}</span>.
                                            </span>{" "}
                                            {breakdown.fighter2Notes}. {breakdown.fighter1Name}'s path requires{" "}
                                            {breakdown.fighter1Notes?.toLowerCase() || "a specific strategy"}.
                                        </>
                                    )
                                }

                                return (
                                    <>
                                        <span className="text-emerald-100 font-medium">
                                            Model bias favors <span className="text-emerald-400">{breakdown.fighter1Name}</span>.
                                        </span>{" "}
                                        {breakdown.fighter1Notes}. {breakdown.fighter2Name}'s path requires{" "}
                                        {breakdown.fighter2Notes?.toLowerCase() || "a specific strategy"}.
                                    </>
                                )
                            })()}
                        </p>
                    </div>

                    {/* MAIN METRICS GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-2">
                        {/* True Line */}
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">MAFS True Line</p>
                            {(() => {
                                const tl = breakdown.trueLine || "";
                                // Check if trueLine is in odds format: contains "/" and has +/- numbers
                                const isOddsFormat = tl.includes("/") && /[+-]\d/.test(tl);
                                if (isOddsFormat) {
                                    const parts = tl.split(" / ");
                                    return (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{breakdown.fighter1Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[0]}</span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{breakdown.fighter2Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[1] || "N/A"}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <p className="font-mono text-sm font-bold text-white pt-1">{tl || "N/A"}</p>
                                );
                            })()}
                        </div>

                        {/* Market Line */}
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Market Line</p>
                            {(() => {
                                const ml = breakdown.marketLine || "";
                                // Check if marketLine is in odds format: contains "/" and has +/- numbers
                                const isOddsFormat = ml.includes("/") && /[+-]\d/.test(ml);
                                if (isOddsFormat) {
                                    const parts = ml.split(" / ");
                                    return (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{breakdown.fighter1Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[0]}</span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{breakdown.fighter2Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[1] || "N/A"}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <p className="text-sm text-gray-400 italic pt-1">{ml || "No odds available"}</p>
                                );
                            })()}
                        </div>

                        {/* Mispricing */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mispricing (Prob)</p>
                            <p className={`text-2xl font-bold tracking-tight ${breakdown.mispricing?.includes("-") ? "text-emerald-400" : "text-emerald-400"}`}>
                                {breakdown.mispricing || "0%"}
                            </p>
                            <p className="text-[9px] text-muted-foreground/40 mt-0.5">Model - Market Implied</p>
                        </div>

                        {/* Expected Value */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">EV per Unit</p>
                            <p className={`text-2xl font-bold tracking-tight ${Number.parseFloat(breakdown.ev?.replace(/[+%]/g, "") || "0") >= 10 ? "text-neon-green glow-text" : "text-emerald-500"}`}>
                                {breakdown.ev || "0%"}
                            </p>
                            <p className="text-[9px] text-muted-foreground/40 mt-0.5">Expected return on $1</p>
                        </div>
                    </div>

                    {/* LINE MOVEMENT CHART */}
                    {breakdown.oddsHistory && breakdown.oddsHistory.length >= 2 && (
                        <div className="pt-2 px-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5" /> Line Movement
                            </p>
                            <div className="p-4 rounded border border-white/5 bg-black/20">
                                <LineMovementChart
                                    data={breakdown.oddsHistory}
                                    color={breakdown.mispricing?.includes("-") || breakdown.ev?.includes("+") ? "#10b981" : "#8b5cf6"}
                                    height={40}
                                    openingOdds={breakdown.oddsHistory[0].oddsAmerican}
                                    currentOdds={typeof breakdown.marketLine === 'string' && breakdown.marketLine.includes('/') ? undefined : undefined} // Keep simple for breakdown UI
                                />
                            </div>
                        </div>
                    )}

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
                        <div className="p-3 bg-white/2 border border-white/5 rounded-lg">
                            <p className="font-mono text-sm text-gray-300">
                                {breakdown.outcomeDistribution || breakdown.pathToVictory?.replace(/\|/g, " | ") || "Calculating distribution..."}
                            </p>
                        </div>
                    </div>

                    {/* MAFS INTELLIGENCE */}
                    {breakdown.mafsIntelligence && breakdown.mafsIntelligence.length > 0 && (
                        <div className="pt-6 border-t border-white/5">
                            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold mb-3">MAFS Intelligence</p>
                            <div className="space-y-2.5">
                                {breakdown.mafsIntelligence.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wide min-w-[100px] mt-0.5">{item.type}</span>
                                        <span className="text-sm text-foreground/80 leading-snug">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SIMULATION PATH BREAKDOWN */}
                    {breakdown.simulationPaths && breakdown.simulationPaths.length > 0 && (
                        <div className="pt-6 border-t border-white/5">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Simulation Path Breakdown</p>
                            <div className="space-y-3">
                                {breakdown.simulationPaths.map((path, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-foreground/90">{path.name}</span>
                                            <span className="text-sm text-muted-foreground/40">—</span>
                                            <span className="text-sm font-mono font-semibold text-primary">{path.pct}%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground/70 leading-relaxed pl-0.5">{path.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MARKET PSYCHOLOGY */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Market Psychology</p>
                        <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-emerald-500/20 pl-4 py-1">
                            "{Array.isArray(breakdown.marketAnalysis) ? breakdown.marketAnalysis.join(" ") : breakdown.marketAnalysis}"
                        </p>
                    </div>

                    {/* MODEL METADATA BAR */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-5 bg-white/2 rounded-xl border border-white/5">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Model-Leaning Outcome</p>
                            <p className="text-sm font-bold text-white max-w-[140px] leading-tight" title={breakdown.modelLeaningOutcome || breakdown.bet}>
                                {breakdown.modelLeaningOutcome || breakdown.bet || "Analyzing..."}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Playable Up To</p>
                            <p className="text-sm font-bold text-emerald-400">
                                {breakdown.playableUpTo || breakdown.bet?.match(/[+-]\d+/)?.[0] || "current line"}
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
                                {breakdown.variance?.split("(")[0] || breakdown.risk || "Medium"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Signal Strength</p>
                            <p className="text-sm font-bold text-white">
                                {breakdown.signalStrength || breakdown.stake || "Moderate"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Recommended Stake</p>
                            <p className="text-sm font-bold text-emerald-400">—</p>
                            <p className="text-[10px] text-muted-foreground/50">Kelly-adjusted</p>
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
