"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { FightBreakdown as FightBreakdownType } from "@/app/(app)/dashboard/d-types"

interface FightBreakdownProps {
    breakdown: FightBreakdownType
    onClose: () => void
}

export function FightBreakdown({ breakdown, onClose }: FightBreakdownProps) {
    return (
        <section className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Card className="glass-card-intense glass-glow overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Fight Breakdown</CardTitle>
                    <button
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Close
                    </button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            System Summary
                        </p>
                        <p className="text-sm text-gray-200">
                            Model bias favors{" "}
                            <span className="font-semibold text-primary">{breakdown.fighter1Name}</span>.{" "}
                            {breakdown.fighter1Notes.split(".")[0]}.{" "}
                            <span className="font-semibold">{breakdown.fighter2Name}</span>
                            {"'"}s path requires {breakdown.fighter2Notes.toLowerCase().split(".")[0]}.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">True Line</p>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-300">
                                    <span className="text-muted-foreground">{breakdown.fighter1Name}:</span>{" "}
                                    <span className="font-mono font-bold text-white">{breakdown.trueLine.split(" / ")[0]}</span>
                                </p>
                                <p className="text-sm text-gray-300">
                                    <span className="text-muted-foreground">{breakdown.fighter2Name}:</span>{" "}
                                    <span className="font-mono font-bold text-white">{breakdown.trueLine.split(" / ")[1]}</span>
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Market Line</p>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-300">
                                    <span className="text-muted-foreground">{breakdown.fighter1Name}:</span>{" "}
                                    <span className="font-mono font-bold text-white">{breakdown.marketLine.split(" / ")[0]}</span>
                                </p>
                                <p className="text-sm text-gray-300">
                                    <span className="text-muted-foreground">{breakdown.fighter2Name}:</span>{" "}
                                    <span className="font-mono font-bold text-white">{breakdown.marketLine.split(" / ")[1]}</span>
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Mispricing</p>
                            <p className="text-xl font-bold text-green-400 glow-text">{breakdown.mispricing}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Model Edge</p>
                            <div
                                className={`text-xl font-bold ${Number.parseFloat(breakdown.ev.replace(/[+%]/g, "")) >= 10 ? "text-neon-green" : "text-green-500"
                                    }`}
                            >
                                {breakdown.ev}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Path to Victory</p>
                            <div className="space-y-2">
                                {breakdown.pathToVictory.split(" | ").map((path, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-white/5">
                                        <span className="text-gray-300">{path.split("(")[0].trim()}</span>
                                        <span className="font-mono text-primary/80">({path.split("(")[1]?.replace(")", "")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Market Analysis</p>
                            <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                "{Array.isArray(breakdown.marketAnalysis) ? breakdown.marketAnalysis.join(" ") : breakdown.marketAnalysis}"
                            </p>
                            {breakdown.varianceReason && (
                                <div className="mt-4 flex items-start gap-2 text-xs text-amber-400 bg-amber-400/5 p-2 rounded">
                                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <span className="font-medium">Variance Warning:</span> {breakdown.varianceReason}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
