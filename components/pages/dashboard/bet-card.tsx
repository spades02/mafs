"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react"
import { ConfidenceRing } from "@/components/premium-metrics"
import { SimulationBet } from "@/app/(app)/dashboard/d-types"
import { LineMovementChart } from "./line-movement-chart"
import { SaveBetButton } from "./save-bet-button"

import { formatOdds, oddsToProb } from "@/lib/odds/utils"

interface BetCardProps {
    bet: SimulationBet
    index: number
    isExpanded: boolean
    onToggle: () => void
    betSeed: number
    oddsFormat?: string
    eventId?: string | null
    eventName?: string | null
    initiallySaved?: boolean
    lastCompletedAt?: Date | null
}

function formatSecondsSince(date: Date): string {
    const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
    if (sec < 60) return `${sec}s ago`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    return `${hr}h ago`
}

export function BetCard({ bet, index, isExpanded, onToggle, betSeed, oddsFormat = "american", eventId, eventName, initiallySaved = false, lastCompletedAt }: BetCardProps) {
    const [edgeBreakdownOpen, setEdgeBreakdownOpen] = useState(true)
    const hasRiskFlag = bet.agentSignals ? bet.agentSignals.some((s) => s.signal === "neutral" || s.signal === "fail") : false
    const passedSignals = bet.agentSignals ? bet.agentSignals.filter((s) => s.signal === "pass").length : 0
    const totalSignals = bet.agentSignals ? bet.agentSignals.length : 0

    // Compute pricing metrics (with NaN/Infinity guards). When odds are missing
    // we deliberately do NOT fall back to -110 — that produced a false 0% EV
    // while mispricing computed against a different (real) line. Render "—"
    // for missing odds so the user sees the data is unavailable.
    const parsedMarketOdds = typeof bet.odds_american === 'string' && bet.odds_american !== "No odds available"
        ? parseInt(bet.odds_american.replace("+", ""))
        : (typeof bet.odds_american === 'number' ? bet.odds_american : NaN)
    const hasValidOdds = typeof parsedMarketOdds === 'number' && isFinite(parsedMarketOdds) && parsedMarketOdds !== 0
    if (!hasValidOdds && bet.odds_american !== "No odds available" && bet.odds_american !== "N/A" && bet.odds_american !== "0") {
        console.warn(`[BetCard] could not parse odds_american:`, bet.odds_american)
    }
    const marketOdds = hasValidOdds ? parsedMarketOdds : NaN
    const modelProb = typeof bet.P_sim === 'number' && isFinite(bet.P_sim) ? Math.min(0.999, Math.max(0.001, bet.P_sim)) : 0.5
    const trueLineAmerican = modelProb >= 0.5
        ? -Math.round((modelProb / (1 - modelProb)) * 100)
        : Math.round(((1 - modelProb) / modelProb) * 100)
    const marketImpliedProb = hasValidOdds
        ? (marketOdds > 0 ? 100 / (marketOdds + 100) : (-marketOdds) / ((-marketOdds) + 100))
        : NaN
    const decimalOdds = hasValidOdds
        ? (marketOdds > 0 ? 1 + (marketOdds / 100) : 1 + (100 / -marketOdds))
        : NaN
    // Prefer server-computed EV / edge to avoid client/server divergence when
    // bet.odds_american is the moneyline-fallback but bet.ev was computed from
    // the prop market odds. Server is the source of truth.
    const serverEvPct = typeof bet.ev === 'number' && isFinite(bet.ev) ? bet.ev : null
    const serverEdgePct = typeof bet.edge_pct === 'number' && isFinite(bet.edge_pct) ? bet.edge_pct : null
    const localEvPct = hasValidOdds && isFinite(decimalOdds)
        ? ((modelProb * (decimalOdds - 1)) - (1 - modelProb)) * 100
        : NaN
    const evPctDisplay = serverEvPct !== null ? serverEvPct : (isFinite(localEvPct) ? localEvPct : NaN)
    // Mispricing in spec = Model Prob − Market Implied (as %), which is exactly edge_pct.
    const mispricingPctDisplay = serverEdgePct !== null
        ? serverEdgePct
        : (hasValidOdds && isFinite(marketImpliedProb) ? (modelProb - marketImpliedProb) * 100 : NaN)
    // Legacy decimal version of EV used by Kelly sizing below.
    const evPerUnit = isFinite(evPctDisplay) ? evPctDisplay / 100 : 0

    // Kelly Criterion estimation (NaN-safe — decimalOdds may be NaN when odds missing)
    const kellyFractionRaw = hasValidOdds && isFinite(decimalOdds) && decimalOdds > 1
        ? ((modelProb * (decimalOdds - 1)) - (1 - modelProb)) / (decimalOdds - 1)
        : 0
    const kellyFraction = isFinite(kellyFractionRaw) ? kellyFractionRaw : 0
    const varianceMultiplier = bet.varianceTag === "low" ? 0.5 : bet.varianceTag === "medium" ? 0.35 : 0.25
    const confidenceMultiplier = Math.min(1, (bet.confidencePct || 70) / 100)
    const adjustedKelly = kellyFraction * varianceMultiplier * confidenceMultiplier
    const kellyUnits = Math.max(0, Math.round(adjustedKelly * 20) / 10)
    const kellyIsPass = !hasValidOdds || kellyUnits <= 0 || evPerUnit <= 0
    const kellyMethod = `${(varianceMultiplier * 100).toFixed(0)}% Kelly`

    // Safe display values
    const safeEdgePct = typeof bet.edge_pct === 'number' && isFinite(bet.edge_pct) ? bet.edge_pct : 0
    const safeModelProbPct = Math.round(modelProb * 100)

    return (
        <Card
            className={`border border-white/5 bg-[#0A0C10] overflow-hidden ${index === 0 ? "top-ev-spotlight" : ""}`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <CardContent className="p-0">
                {/* TOP LAYER */}
                <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                                {bet.fight
                                    ? bet.bet_type === 'ML'
                                        ? `${bet.fight} · ${bet.label}`
                                        : `${bet.fight} — ${bet.label}`
                                    : bet.label}
                            </h3>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="font-mono text-muted-foreground/80">{formatOdds(bet.odds_american, oddsFormat)}</span>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="uppercase tracking-wider text-muted-foreground/50 font-medium">MARKET: {isFinite(marketImpliedProb) ? `${(marketImpliedProb * 100).toFixed(0)}%` : "—"} IMPLIED</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {index === 0 && (
                                <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Top Pick
                                </span>
                            )}
                            <SaveBetButton
                                bet={bet}
                                eventId={eventId}
                                eventName={eventName}
                                initiallySaved={initiallySaved}
                            />
                        </div>
                    </div>

                    {/* Probs & Edge Row */}
                    <div className="flex items-center gap-8 mb-6">
                        {/* Left: Prob */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <ConfidenceRing value={safeModelProbPct} size={70} />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-medium">Model Probability</span>
                        </div>

                        {/* Right: Edge */}
                        <div className="flex-1 max-w-[240px]">
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-1 block">Model Edge</span>
                            <div className="text-3xl font-bold tracking-tight text-emerald-400 mb-2">
                                {safeEdgePct > 0 ? "+" : ""}{safeEdgePct.toFixed(1)}%
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${Math.min(100, Math.max(0, safeEdgePct * 10))}%` }} />
                            </div>
                            <span className={`text-[9px] uppercase tracking-widest font-bold ${safeEdgePct >= 5 ? "text-emerald-400" : safeEdgePct >= 2 ? "text-emerald-400/80" : "text-amber-400"}`}>
                                {safeEdgePct >= 7 ? "Massive Edge (>7%)" : safeEdgePct >= 5 ? "Large Edge (5-7%)" : safeEdgePct >= 2 ? "Small Edge (2-5%)" : "Marginal Edge (<2%)"}
                            </span>
                        </div>
                    </div>

                    {/* AI Insight (full width — "Why this is a bet" moved to MAFS Intelligence) */}
                    <div className="p-4 rounded-xl border border-white/5 bg-[#0F1117] mb-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[9px] uppercase tracking-widest text-emerald-400/90 font-bold">AI Insight</span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">
                            {bet.executiveSummary || bet.whySummary || "Significant structural advantage identified due to discrepancy between fighter win conditions and generic market pricing lines."}
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded text-[9px] font-medium border ${
                            bet.confidencePct >= 75 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            bet.confidencePct >= 60 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-white/5 text-muted-foreground border-white/10"
                        }`}>
                            {bet.confidencePct >= 75 ? "High Confidence" : bet.confidencePct >= 60 ? "Medium Confidence" : "Low Confidence"}
                        </span>
                    </div>

                    {/* Line Movement Wide Block */}
                    {(() => {
                        const validHistory = (bet.oddsHistory || []).filter(
                            (p) => typeof p?.oddsAmerican === "number" && !isNaN(p.oddsAmerican),
                        )
                        if (validHistory.length < 2) return null

                        const firstOdds = validHistory[0].oddsAmerican
                        const lastOdds = validHistory[validHistory.length - 1].oddsAmerican
                        // Compare via implied probability so direction stays correct
                        // across negative ↔ positive crossings:
                        //   -150 → -170: implied 60% → 63%, delta>0 → toward (line tightening)
                        //   -170 → -150: implied 63% → 60%, delta<0 → away (line widening)
                        //   +150 → +130: implied 40% → 43%, delta>0 → toward
                        //   +130 → +150: implied 43% → 40%, delta<0 → away
                        const impliedDelta = oddsToProb(lastOdds) - oddsToProb(firstOdds)
                        const STABLE_THRESHOLD = 0.005
                        const isMovingToward = impliedDelta >  STABLE_THRESHOLD
                        const isMovingAway   = impliedDelta < -STABLE_THRESHOLD

                        return (
                            <div className="p-4 rounded-xl border border-white/5 bg-[#0F1117] mb-5">
                                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-3 block">Line Movement</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 max-w-[200px]">
                                        <LineMovementChart
                                            data={validHistory}
                                            color={bet.edge_pct > 0 ? "#34d399" : "#f43f5e"}
                                            height={30}
                                            openingOdds={firstOdds}
                                            currentOdds={lastOdds}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-mono">
                                        <span className="text-muted-foreground/50">{firstOdds > 0 ? `+${firstOdds}` : firstOdds}</span>
                                        <span className="text-muted-foreground/30">→</span>
                                        <span className="font-bold text-amber-400">{lastOdds > 0 ? `+${lastOdds}` : lastOdds}</span>
                                    </div>
                                </div>
                                <p className={`text-[10px] font-medium mt-3 flex items-center gap-1 ${isMovingToward ? "text-emerald-400/80" : isMovingAway ? "text-amber-400/80" : "text-muted-foreground/50"}`}>
                                    {isMovingToward ? "Market Moving Toward Bet" : isMovingAway ? "Market Moving Away" : "Market Stable"} <span className="text-[8px] uppercase font-bold tracking-widest ml-1">{isMovingToward ? "↘" : isMovingAway ? "↗" : "→"}</span>
                                </p>
                            </div>
                        )
                    })()}

                    {/* Outcome Indicators Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                        {passedSignals >= 2 ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-emerald-400/90">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Model Edge
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-muted-foreground/40">
                                <CheckCircle2 className="w-3.5 h-3.5" /> No Edge
                            </span>
                        )}
                        {bet.edge_pct >= 3 ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-emerald-400/90">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Market Inefficiency
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-muted-foreground/40">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Market Efficient
                            </span>
                        )}
                        {bet.agentSignals?.find((s) => s.name === "Matchup Fit" && s.signal === "pass") ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-emerald-400/90">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Matchup Fit
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-muted-foreground/40">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Matchup Clash
                            </span>
                        )}
                        {hasRiskFlag && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-orange-400/90">
                                <AlertTriangle className="w-3 h-3" /> Risk Flag
                            </span>
                        )}
                    </div>
                </div>

                {/* MAFS INTELLIGENCE BREAKDOWN TOGGLE */}
                <div 
                    onClick={onToggle}
                    className="flex items-center justify-between px-5 py-4 border-y border-white/5 bg-[#0A0C10] cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold">MAFS Intelligence Breakdown</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/50" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/50" />}
                </div>

                {/* EXPANDABLE SECTION */}
                {isExpanded && (
                    <div className="p-5 pb-6 bg-[#0A0C10] animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* FULL EDGE BREAKDOWN — Core Thesis + Supporting Signals */}
                        {(() => {
                            const coreThesis =
                                bet.marketThesis ||
                                bet.executiveSummary ||
                                bet.detailedReason.marketInefficiency ||
                                ""

                            const supporting: string[] = []
                            if (bet.detailedReason.keyDrivers?.length) {
                                supporting.push(...bet.detailedReason.keyDrivers)
                            }
                            if (bet.patternMechanics?.length) {
                                supporting.push(...bet.patternMechanics)
                            }
                            if (supporting.length === 0) {
                                if (bet.patternInsight) supporting.push(bet.patternInsight)
                                if (bet.edgeSource) supporting.push(`Edge source: ${bet.edgeSource}`)
                                supporting.push(`Model probability ${(bet.P_sim * 100).toFixed(0)}% vs market implied ${(marketImpliedProb * 100).toFixed(0)}%`)
                            }

                            return (
                                <div className="mb-6 rounded-xl border border-white/5 bg-[#0F1117] overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setEdgeBreakdownOpen((v) => !v)}
                                        aria-expanded={edgeBreakdownOpen}
                                        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left"
                                    >
                                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold">Full Edge Breakdown</span>
                                        {edgeBreakdownOpen
                                            ? <ChevronUp className="w-4 h-4 text-muted-foreground/50" />
                                            : <ChevronDown className="w-4 h-4 text-muted-foreground/50" />}
                                    </button>
                                    {edgeBreakdownOpen && (
                                        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {coreThesis && (
                                                <div className="p-4 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/15">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        <span className="text-[9px] uppercase tracking-widest text-emerald-400/90 font-bold">Core Thesis</span>
                                                    </div>
                                                    <p className="text-sm text-white/90 leading-relaxed">{coreThesis}</p>
                                                </div>
                                            )}

                                            <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-bold">Supporting Signals</span>
                                                </div>
                                                <div className="space-y-2.5">
                                                    {supporting.map((item, sIdx) => (
                                                        <div key={sIdx} className="flex items-start gap-2.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                            <p className="text-[13px] text-foreground/80 leading-snug">{item}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })()}

                        {/* Executive Summary */}
                        <p className="text-[13px] text-muted-foreground/70 leading-relaxed mb-6">
                            {bet.detailedReason.marketInefficiency ||
                                bet.executiveSummary ||
                                "Identified systemic discrepancy between fighter win conditions and generic market pricing."}
                        </p>

                        {/* MAFS VERDICT */}
                        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
                                <span className="text-[9px] uppercase tracking-widest text-emerald-400/90 font-bold">MAFS Verdict</span>
                            </div>
                            <p className="text-white text-base font-bold mb-5 leading-tight">
                                {bet.verdict ||
                                    (bet.edge_pct >= 5 && passedSignals >= 2
                                        ? `Playable — ${bet.label} up to ${typeof bet.odds_american === 'number' ? (bet.odds_american > 0 ? '+'+bet.odds_american : bet.odds_american) : bet.odds_american}`
                                        : bet.edge_pct >= 2
                                            ? `Consider with reduced stake — volatility adjusted`
                                            : `Monitor only — edge below threshold`)}
                            </p>

                            <div className="grid grid-cols-4 gap-4 border-t border-emerald-500/10 pt-4">
                                {/* Edge */}
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase tracking-widest text-emerald-400/50 font-bold mb-1">Edge</span>
                                    <span className="text-sm font-bold text-emerald-400">+{bet.edge_pct.toFixed(1)}%</span>
                                    <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-400/60 mt-auto">{bet.edge_pct >= 5 ? "Large" : "Small"}</span>
                                </div>
                                {/* EV */}
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase tracking-widest text-emerald-400/50 font-bold mb-1">Expected Value</span>
                                    <span className="text-sm font-bold text-emerald-400">
                                        {isFinite(evPctDisplay) ? `${evPctDisplay >= 0 ? "+" : ""}${evPctDisplay.toFixed(1)}%` : "—"}
                                    </span>
                                </div>
                                {/* Stake */}
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase tracking-widest text-emerald-400/50 font-bold mb-1">Recommended Stake</span>
                                    <span className="text-sm font-bold text-white">{kellyIsPass ? "Pass" : `${kellyUnits} Units`}</span>
                                </div>
                                {/* Model Prob */}
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase tracking-widest text-emerald-400/50 font-bold mb-1">Model Prob</span>
                                    <span className="text-sm font-bold text-white">{(bet.P_sim * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* AI SIGNAL CHECKLIST */}
                        <div className="mb-6 rounded-xl border border-white/5 bg-[#0F1117] overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                                        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold">AI Signal Checklist</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">{passedSignals}/{totalSignals} passed</span>
                            </div>
                            <div className="p-2">
                                {bet.agentSignals?.map((sig: any, sIdx: number) => (
                                    <div key={sIdx} className="flex items-center justify-between p-2.5 group">
                                        <div className="flex items-center gap-3">
                                            {sig.signal === "pass" ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : sig.signal === "neutral" ? (
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                                            )}
                                            <span className="text-xs text-muted-foreground/80 font-medium">{sig.name}</span>
                                        </div>
                                        <div className="w-4 h-4 rounded-full border border-white/5 bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] text-muted-foreground">i</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RISK CALLOUT */}
                        {bet.detailedReason.riskFactors && bet.detailedReason.riskFactors.length > 0 && (
                            <div className="mb-8 p-3 rounded-lg border border-amber-500/10 bg-[linear-gradient(to_right,rgba(245,158,11,0.05),transparent)]">
                                <p className="text-[11px] text-amber-500/80 leading-relaxed">
                                    <span className="font-bold uppercase tracking-widest text-[9px] mr-2">Primary Risk:</span>
                                    {bet.detailedReason.riskFactors[0].toLowerCase()}
                                </p>
                            </div>
                        )}

                        {/* MARKET PRICING TABLE */}
                        <div className="rounded-xl border border-white/5 bg-[#0F1117] overflow-hidden mb-6">
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold">Market Pricing</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground/40 font-bold">
                                        Updated {lastCompletedAt ? formatSecondsSince(lastCompletedAt) : "—"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2">
                                {/* Market Line — fall back to chart's last point so the
                                    displayed price always equals the chart endpoint. */}
                                {(() => {
                                    const validHistory = (bet.oddsHistory || []).filter(
                                        (p) => typeof p?.oddsAmerican === "number" && !isNaN(p.oddsAmerican),
                                    )
                                    const fallbackOdds = validHistory.length
                                        ? validHistory[validHistory.length - 1].oddsAmerican
                                        : null
                                    const marketLineOdds = hasValidOdds
                                        ? bet.odds_american
                                        : (fallbackOdds !== null ? fallbackOdds : bet.odds_american)
                                    const marketLineImplied = hasValidOdds
                                        ? marketImpliedProb
                                        : (fallbackOdds !== null ? oddsToProb(fallbackOdds) : NaN)
                                    return (
                                        <div className="p-5 text-center border-b border-r border-white/5">
                                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-2 block">Market Line</span>
                                            <p className="text-2xl font-bold font-mono text-white mb-1">{formatOdds(marketLineOdds, oddsFormat)}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-bold">
                                                Implied: {isFinite(marketLineImplied) ? `${(marketLineImplied * 100).toFixed(0)}%` : "—"}
                                            </p>
                                        </div>
                                    )
                                })()}
                                {/* True Line */}
                                <div className="p-5 text-center border-b border-white/5 relative bg-emerald-500/[0.02]">
                                    <span className="text-[9px] uppercase tracking-widest text-emerald-400/50 font-bold mb-2 block">MAFS True Line</span>
                                    <p className="text-2xl font-bold font-mono text-emerald-400 mb-1">{trueLineAmerican > 0 ? `+${trueLineAmerican}` : trueLineAmerican}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-emerald-400/50 font-bold">Model: {(modelProb * 100).toFixed(0)}%</p>
                                </div>
                                {/* Mispricing */}
                                <div className="p-5 text-center border-b border-r border-white/5">
                                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-2 block">Mispricing</span>
                                    <p className={`text-xl font-bold font-mono ${
                                        !isFinite(mispricingPctDisplay) ? "text-muted-foreground" :
                                        mispricingPctDisplay >= 5 ? "text-emerald-400" :
                                        mispricingPctDisplay >= 0 ? "text-amber-400" : "text-rose-400"
                                    }`}>
                                        {isFinite(mispricingPctDisplay) ? `${mispricingPctDisplay >= 0 ? "+" : ""}${mispricingPctDisplay.toFixed(1)}%` : "—"}
                                    </p>
                                </div>
                                {/* Expected Value */}
                                <div className="p-5 text-center border-b border-white/5">
                                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-2 block">Expected Value</span>
                                    <p className={`text-xl font-bold font-mono ${
                                        !isFinite(evPctDisplay) ? "text-muted-foreground" :
                                        evPctDisplay > 0 ? "text-emerald-400" : "text-rose-400"
                                    }`}>
                                        {isFinite(evPctDisplay) ? `${evPctDisplay >= 0 ? "+" : ""}${evPctDisplay.toFixed(1)}%` : "—"}
                                    </p>
                                </div>
                            </div>
                            
                            {/* sizing block */}
                            <div className="p-4 bg-black/20 flex items-center justify-between border-t border-white/5">
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-bold">Recommended Stake</span>
                                        <span className={`text-sm font-bold font-mono ${kellyIsPass ? "text-muted-foreground" : "text-emerald-400"}`}>{kellyIsPass ? "Pass" : `${kellyUnits} units`}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-bold">Sizing Method</span>
                                        <span className="text-[10px] font-mono text-muted-foreground/50">{kellyMethod}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-white/5 w-full">
                                        <p className="text-[8px] uppercase tracking-widest text-muted-foreground/30 font-bold scale-90 origin-left">
                                            EV = (Model Prob × Profit) - (1 - Model Prob) | Mispricing = Model Prob - Market Implied
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RELATED PROPS DUMMY SECTION - For aesthetic matching  */}
                        {bet.bet_type !== "ML" && (
                            <div className="mt-2">
                                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-3 block">Related Props</span>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 rounded bg-black/20 border border-white/5">
                                        <span className="text-xs text-muted-foreground font-medium">{bet.fight ? bet.fight.split('vs')[0].trim() : "Fighter"} ITD</span>
                                        <div className="flex items-center gap-3 font-mono text-[11px]">
                                            <span className="text-muted-foreground/50">+140</span>
                                            <span className="text-emerald-400 font-bold">EV: +0.7%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded bg-black/20 border border-white/5">
                                        <span className="text-xs text-muted-foreground font-medium">{bet.fight ? bet.fight.split('vs')[0].trim() : "Fighter"} by Finish</span>
                                        <div className="flex items-center gap-3 font-mono text-[11px]">
                                            <span className="text-muted-foreground/50">+165</span>
                                            <span className="text-emerald-400 font-bold">EV: +0.1%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* END EXPANDABLE */}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

