"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react"
import { ConfidenceRing } from "@/components/premium-metrics"
import { SimulationBet } from "@/app/(app)/dashboard/d-types"
import { LineMovementChart } from "./line-movement-chart"

import { formatOdds } from "@/lib/odds/utils"

interface BetCardProps {
    bet: SimulationBet
    index: number
    isExpanded: boolean
    onToggle: () => void
    betSeed: number
    oddsFormat?: string
}

export function BetCard({ bet, index, isExpanded, onToggle, betSeed, oddsFormat = "american" }: BetCardProps) {
    const hasRiskFlag = bet.agentSignals.some((s) => s.signal === "neutral" || s.signal === "fail")
    const passedSignals = bet.agentSignals.filter((s) => s.signal === "pass").length

    // Compute pricing metrics for the expanded Market Pricing table
    const marketOdds = parseInt(bet.odds_american.replace("+", ""))
    const modelProb = bet.P_sim
    const trueLineAmerican = modelProb >= 0.5
        ? -Math.round((modelProb / (1 - modelProb)) * 100)
        : Math.round(((1 - modelProb) / modelProb) * 100)
    const marketImpliedProb = marketOdds > 0
        ? 100 / (marketOdds + 100)
        : (-marketOdds) / ((-marketOdds) + 100)
    const decimalOdds = marketOdds > 0 ? 1 + (marketOdds / 100) : 1 + (100 / -marketOdds)
    const evPerUnit = (modelProb * (decimalOdds - 1)) - ((1 - modelProb) * 1)
    const mispricingProb = modelProb - marketImpliedProb

    // Kelly Criterion estimation
    const kellyFraction = ((modelProb * (decimalOdds - 1)) - (1 - modelProb)) / (decimalOdds - 1)
    const varianceMultiplier = bet.varianceTag === "low" ? 0.5 : bet.varianceTag === "medium" ? 0.35 : 0.25
    const confidenceMultiplier = Math.min(1, (bet.confidencePct || 70) / 100)
    const adjustedKelly = kellyFraction * varianceMultiplier * confidenceMultiplier
    const kellyUnits = Math.max(0, Math.round(adjustedKelly * 20) / 10)
    const kellyIsPass = kellyUnits <= 0 || evPerUnit <= 0
    const kellyMethod = `${(varianceMultiplier * 100).toFixed(0)}% Kelly × ${(confidenceMultiplier * 100).toFixed(0)}% conf`

    return (
        <Card
            className={`glass-card glass-glow best-bet-entrance-polish spotlight-hover overflow-hidden ${index === 0 ? "top-ev-spotlight glass-shimmer morph-border" : ""
                }`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <CardContent className="p-5 relative">
                {/* OUTCOME LAYER - Always Visible */}
                <div className="mb-4">
                    {bet.fight && <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">{bet.fight}</p>}
                    <p className="font-semibold text-lg leading-tight text-white">{bet.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground/60 font-mono">{formatOdds(bet.odds_american, "american")}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${bet.bet_type === "ML" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            bet.bet_type === "ITD" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                bet.bet_type === "Over" || bet.bet_type === "Under" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                    bet.bet_type === "MOV" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        bet.bet_type === "Round" ? "bg-pink-500/10 text-pink-400 border-pink-500/20" :
                                            bet.bet_type === "Double Chance" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                                bet.bet_type === "GTD" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                                                    bet.bet_type === "DGTD" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-white/5 text-muted-foreground border-white/10"
                            }`}>
                            {bet.bet_type === "Over" || bet.bet_type === "Under" ? "O/U" : bet.bet_type}
                        </span>
                    </div>
                </div>

                {/* Metrics Row — matching screenshot layout */}
                <div className="flex items-start gap-6 mb-4">
                    <div className="flex items-center gap-3 shrink-0">
                        <ConfidenceRing value={bet.P_sim * 100} size={48} />
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">Model Probability</p>
                            <p className="text-xl font-bold text-white">{(bet.P_sim * 100).toFixed(0)}%</p>
                            <p className="text-[9px] text-muted-foreground/40">
                                Range: {Math.max(0, Math.round(bet.P_sim * 100 - (bet.varianceTag === "high" ? 8 : bet.varianceTag === "medium" ? 5 : 3)))}%-{Math.min(100, Math.round(bet.P_sim * 100 + (bet.varianceTag === "high" ? 8 : bet.varianceTag === "medium" ? 5 : 3)))}%
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 pl-4 border-l border-white/5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">Model Edge <span className="text-muted-foreground/30">(Risk-Adj.)</span></p>
                        <p className={`text-2xl font-bold font-mono tracking-tight ${bet.edge_pct > 0 ? "text-primary" : "text-red-400"}`}>
                            {bet.edge_pct > 0 ? "+" : ""}{bet.edge_pct.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Line Movement Box — separate bordered container */}
                {bet.oddsHistory && bet.oddsHistory.length >= 2 && (() => {
                    const firstOdds = bet.oddsHistory[0].oddsAmerican
                    const lastOdds = bet.oddsHistory[bet.oddsHistory.length - 1].oddsAmerican
                    const currentOdds = typeof bet.odds_american === 'string' && (bet.odds_american.includes('+') || bet.odds_american.includes('-'))
                        ? parseInt(bet.odds_american) : lastOdds
                    const isMovingToward = Math.abs(currentOdds) < Math.abs(firstOdds) || currentOdds < firstOdds
                    const isMovingAway = Math.abs(currentOdds) > Math.abs(firstOdds) || currentOdds > firstOdds

                    return (
                        <div className="p-3 rounded-lg bg-black/30 border border-white/5 mb-4">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-2">Line Movement</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 max-w-[140px]">
                                    <LineMovementChart
                                        data={bet.oddsHistory}
                                        color={bet.edge_pct > 0 ? "#10b981" : "#f43f5e"}
                                        height={30}
                                        openingOdds={firstOdds}
                                        currentOdds={currentOdds}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm font-mono">
                                    <span className="text-muted-foreground/60">{firstOdds > 0 ? `+${firstOdds}` : firstOdds}</span>
                                    <span className="text-muted-foreground/30">→</span>
                                    <span className="font-bold text-white">{currentOdds > 0 ? `+${currentOdds}` : currentOdds}</span>
                                </div>
                            </div>
                            <p className={`text-[10px] font-medium mt-1.5 flex items-center gap-1 ${isMovingToward ? "text-green-400/80" : isMovingAway ? "text-amber-400/80" : "text-muted-foreground/50"}`}>
                                {isMovingToward ? "Market Moving Toward Bet →" : isMovingAway ? "Market Moving Away ←" : "Market Stable"}
                            </p>
                        </div>
                    )
                })()}

                {/* Outcome Indicators */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {bet.agentSignals.filter((s) => s.signal === "pass").length >= 2 && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary/90">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Model Edge
                        </span>
                    )}
                    {bet.edge_pct >= 3 && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary/90">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Market Inefficiency
                        </span>
                    )}
                    {bet.agentSignals.find((s) => s.name === "Matchup Fit" && s.signal === "pass") && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary/90">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Matchup Fit
                        </span>
                    )}
                    {hasRiskFlag && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-400/90">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Risk Flag
                        </span>
                    )}
                </div>

                {/* Accordion Toggle */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2.5 border-t border-white/5"
                >
                    <span className="uppercase tracking-wider">MAFS Intelligence Breakdown</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* EXPANDABLE SECTION */}
                {isExpanded && (
                    <div className="pt-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

                        {/* Executive Summary */}
                        <p className="text-sm text-muted-foreground/80 leading-relaxed border-l-2 border-white/10 pl-3">
                            {bet.executiveSummary ||
                                bet.whySummary ||
                                bet.detailedReason.marketInefficiency ||
                                `${bet.label} possesses a structural advantage overlooked by public pricing.`}
                        </p>

                        {/* MAFS VERDICT */}
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <p className="text-[10px] uppercase tracking-wider text-primary mb-2">MAFS Verdict</p>
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                                {bet.verdict ||
                                    (bet.edge_pct >= 5 && passedSignals >= 3
                                        ? `Playable — ${bet.label} up to ${bet.odds_american}`
                                        : bet.edge_pct >= 2
                                            ? `Consider with reduced stake — volatility adjusted`
                                            : `Monitor only — edge below threshold`)}
                            </p>
                        </div>

                        {/* AGENT SIGNALS */}
                        <div className="rounded-lg border border-white/5 bg-black/20">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                                <div>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Agent Signals</span>
                                    <span className="text-[9px] text-muted-foreground/40 ml-2">Signal Agreement Check</span>
                                </div>
                                <span className="text-[10px] font-mono text-primary/70">
                                    {passedSignals}/{bet.agentSignals.length}
                                </span>
                            </div>
                            <div className="px-3 py-2.5 space-y-1.5">
                                {bet.agentSignals.map((signal, sIdx) => (
                                    <div key={sIdx} className="flex items-center gap-2 text-xs">
                                        <span className={signal.signal === "pass" ? "text-green-400" : signal.signal === "neutral" ? "text-amber-400" : "text-red-400"}>
                                            {signal.signal === "pass" ? "✓" : signal.signal === "neutral" ? "⚠" : "✗"}
                                        </span>
                                        <span className="text-foreground/70">{signal.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MAFS Edge Source */}
                        <div className="px-3 py-2 rounded border border-white/5 bg-black/30">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Edge Source</p>
                            <p className="text-xs text-foreground/80 leading-snug line-clamp-2">
                                {bet.edgeSource || bet.detailedReason.marketInefficiency?.split('.').slice(0, 2).join('.') + '.' || "Identified systemic discrepancy between fighter win conditions and generic market pricing."}
                            </p>
                        </div>

                        {/* RISK CALLOUT */}
                        {hasRiskFlag && bet.detailedReason.riskFactors[0] && (
                            <div className="px-3 py-2 rounded bg-amber-500/5 border border-amber-500/10">
                                <p className="text-xs text-amber-400/80">
                                    <span className="font-medium">Primary risk:</span> {bet.detailedReason.riskFactors[0].toLowerCase()}
                                </p>
                            </div>
                        )}

                        {/* MARKET PRICING TABLE */}
                        <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                                <div>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Market Pricing</span>
                                    <p className="text-[9px] text-muted-foreground/40 mt-0.5">Derived from aggregated market odds</p>
                                </div>
                            </div>
                            {/* Row 1: Market Line + True Line */}
                            <div className="grid grid-cols-2 gap-4 p-3 border-b border-white/5">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Market Line</p>
                                    <p className="text-lg font-bold font-mono text-foreground/90">{formatOdds(bet.odds_american, "american")}</p>
                                    <p className="text-[9px] text-muted-foreground/40 mt-0.5">Implied: {(marketImpliedProb * 100).toFixed(0)}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">MAFS True Line</p>
                                    <p className="text-lg font-bold font-mono text-primary">{trueLineAmerican > 0 ? `+${trueLineAmerican}` : trueLineAmerican}</p>
                                    <p className="text-[9px] text-muted-foreground/40 mt-0.5">Model: {(modelProb * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                            {/* Row 2: Mispricing + EV */}
                            <div className="grid grid-cols-2 gap-4 p-3 border-b border-white/5">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Mispricing</p>
                                    <p className={`text-lg font-bold font-mono ${mispricingProb >= 0.05 ? "text-green-400" : mispricingProb >= 0 ? "text-amber-400" : "text-red-400"}`}>
                                        {mispricingProb >= 0 ? "+" : ""}{(mispricingProb * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Expected Value</p>
                                    <p className={`text-lg font-bold font-mono ${evPerUnit > 0 ? "text-green-400" : "text-red-400"}`}>
                                        {evPerUnit >= 0 ? "+" : ""}{(evPerUnit * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                            {/* Row 3: Recommended Stake */}
                            <div className="px-3 py-2.5">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">Recommended Stake</span>
                                        <span className={`text-sm font-bold font-mono ${kellyIsPass ? "text-muted-foreground" : "text-green-400"}`}>
                                            {kellyIsPass ? "Pass" : `${kellyUnits} units`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">Sizing Method</span>
                                        <span className="text-xs font-mono text-muted-foreground/70">{kellyMethod}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Formula Note */}
                            <div className="px-3 py-2 border-t border-white/5">
                                <p className="text-[9px] text-muted-foreground/40 italic">EV = (Model Prob × Profit) - (1 - Model Prob) | Mispricing = Model Prob - Market Implied</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
