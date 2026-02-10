"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, AlertTriangle, Shield, ArrowLeft } from "lucide-react"
import { SimulationStats } from "@/components/pages/dashboard/simulation-stats"
import { BetCard } from "@/components/pages/dashboard/bet-card"
import { FightTable } from "@/components/pages/dashboard/fight-table"
import { FightBreakdown } from "@/components/pages/dashboard/fight-breakdown"
import { Fight, SimulationBet, FightBreakdown as FightBreakdownModel } from "@/app/(app)/dashboard/d-types"
import { formatOdds } from "@/lib/odds/utils"

const MIN_MAF_PROB = 0.55
const MIN_AGENT_CONSENSUS_PASS_RATE = 0.7
const MIN_EDGE_PCT = 0.5
const BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW = 0.55

interface AnalysisResultClientProps {
    eventName: string
    eventDate: string
    fights: Fight[]
    bets: SimulationBet[]
    breakdowns: Record<string, FightBreakdownModel>
    userOddsFormat?: string
}

export default function AnalysisResultClient({ eventName, eventDate, fights, bets, breakdowns, userOddsFormat = "american" }: AnalysisResultClientProps) {
    const router = useRouter()
    const [selectedFight, setSelectedFight] = useState<string | null>(null)
    const [expandedBetIdx, setExpandedBetIdx] = useState<number | null>(null)
    const [showFilteredBets, setShowFilteredBets] = useState(false)

    const qualifyBets = (bets: SimulationBet[]): SimulationBet[] => {
        return bets.map((bet) => {
            const rejectReasons: string[] = []
            const agentSignals = bet.agentSignals || []
            const passCount = agentSignals.filter((s) => s.signal === "pass").length
            const agentPassRate = agentSignals.length > 0 ? passCount / agentSignals.length : 0

            if (bet.P_sim < MIN_MAF_PROB) {
                rejectReasons.push(`Win probability ${(bet.P_sim * 100).toFixed(0)}% below ${MIN_MAF_PROB * 100}% threshold`)
            }
            if (bet.edge_pct < MIN_EDGE_PCT) {
                rejectReasons.push(`Edge ${bet.edge_pct.toFixed(1)}% below ${MIN_EDGE_PCT}% minimum`)
            }
            if (agentPassRate < MIN_AGENT_CONSENSUS_PASS_RATE) {
                rejectReasons.push(
                    `Agent consensus ${(agentPassRate * 100).toFixed(0)}% below ${MIN_AGENT_CONSENSUS_PASS_RATE * 100}% threshold`,
                )
            }
            if (bet.varianceTag === "high" && bet.confidencePct / 100 < BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW) {
                rejectReasons.push(
                    `High variance blocked: confidence ${bet.confidencePct}% below ${BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW * 100}%`,
                )
            }

            return {
                ...bet,
                status: rejectReasons.length === 0 ? "qualified" : "filtered",
                rejectReasons,
            }
        })
    }

    const allBets = qualifyBets(bets)

    // Sort both lists by edge_pct descending to ensure best options are shown
    const sortedQualifiedBets = allBets
        .filter((b) => b.status === "qualified")
        .sort((a, b) => b.edge_pct - a.edge_pct)

    const sortedFilteredBets = allBets
        .filter((b) => b.status === "filtered")
        .sort((a, b) => b.edge_pct - a.edge_pct)

    // Always show at least 3 bets if available
    const topBets = [...sortedQualifiedBets]
    if (topBets.length < 3) {
        const needed = 3 - topBets.length
        // Exclude "No Bet" outcomes from being backfilled into top picks
        const validFiltered = sortedFilteredBets.filter(b =>
            b.label !== "No Bet" &&
            b.label !== "Pass" &&
            !b.label.toLowerCase().includes("no bet")
        )
        topBets.push(...validFiltered.slice(0, needed))
    }

    const topBetIds = new Set(topBets.map(b => b.id))
    const filteredBets = sortedFilteredBets.filter(b => !topBetIds.has(b.id))
    const qualifiedBets = sortedQualifiedBets

    const avgConfidence =
        topBets.length > 0 ? topBets.reduce((sum, b) => sum + b.confidencePct, 0) / topBets.length : 0
    const avgEdge =
        topBets.length > 0 ? topBets.reduce((sum, b) => sum + b.edge_pct, 0) / topBets.length : 0
    const hasHighVariance = topBets.some((b) => b.varianceTag === "high")
    const riskLevel = hasHighVariance || avgConfidence < 55 ? "High" : avgConfidence < 62 ? "Medium" : "Low"

    return (
        <div className="min-h-fit premium-bg overflow-y-hidden neural-bg font-sans selection:bg-primary/30 pb-20">
            <div className="hero-orb" />
            <div className="hero-orb-secondary" />
            <div className="scanlines" />

            {/* Particles */}
            <div className="particle" style={{ left: "10%", animationDelay: "0s" }} />
            <div className="particle" style={{ left: "20%", animationDelay: "2s" }} />
            <div className="particle" style={{ left: "35%", animationDelay: "4s" }} />
            <div className="particle" style={{ left: "55%", animationDelay: "1s" }} />
            <div className="particle" style={{ left: "70%", animationDelay: "3s" }} />
            <div className="particle" style={{ left: "85%", animationDelay: "5s" }} />
            <div className="particle" style={{ left: "95%", animationDelay: "2.5s" }} />

            <main className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">

                {/* Header */}
                <div className="mb-8 pt-4">
                    <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-white mb-4 pl-0 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to History
                    </Button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            Saved Analysis
                        </div>
                        <span className="text-muted-foreground/40">|</span>
                        <p className="text-xs uppercase tracking-widest text-primary/70 font-medium">MAFS Intelligence Engine</p>
                    </div>

                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{eventName}</h1>
                    <p className="text-muted-foreground">{eventDate}</p>
                </div>


                <div className="space-y-12">

                    <SimulationStats
                        qualifiedBets={qualifiedBets}
                        avgConfidence={avgConfidence}
                        avgEdge={avgEdge}
                        riskLevel={riskLevel}
                    />

                    {/* Top Bets */}
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-white">Simulation Outcomes</h2>
                        </div>

                        {topBets.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {topBets.slice(0, 3).map((bet, idx) => (
                                    <BetCard
                                        key={bet.id}
                                        bet={bet}
                                        index={idx}
                                        isExpanded={expandedBetIdx === idx}
                                        onToggle={() => setExpandedBetIdx(expandedBetIdx === idx ? null : idx)}
                                        betSeed={0}
                                        oddsFormat={userOddsFormat}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="glass-card glass-shimmer border-dashed border-white/10 overflow-hidden">
                                <CardContent className="p-8 text-center">
                                    <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground mb-2">No Scenarios Available</p>
                                    <p className="text-sm text-muted-foreground/70">
                                        All outcomes for this event were filtered by the simulation engine.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </section>

                    {filteredBets.length > 0 && (
                        <section className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <button
                                onClick={() => setShowFilteredBets(!showFilteredBets)}
                                className="w-full flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/40 hover:bg-black/50 transition-colors"
                            >
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    Filtered by Simulation ({filteredBets.length})
                                </span>
                                {showFilteredBets ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>

                            {showFilteredBets && (
                                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {filteredBets.map((bet) => (
                                        <Card key={bet.id} className="bg-black/30 border-white/5">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium text-muted-foreground">{bet.label}</p>
                                                        <p className="text-xs text-muted-foreground/60 font-mono">{formatOdds(bet.odds_american, userOddsFormat)}</p>
                                                    </div>
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                        Not recommended
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {bet.rejectReasons?.map((reason, rIdx) => (
                                                        <span key={rIdx} className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded">
                                                            {reason}
                                                        </span>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    <FightTable
                        fights={fights}
                        selectedFightId={selectedFight}
                        onSelectFight={setSelectedFight}
                        oddsFormat={userOddsFormat}
                    />

                    {selectedFight && breakdowns[selectedFight] && (
                        <FightBreakdown
                            breakdown={breakdowns[selectedFight]}
                            onClose={() => setSelectedFight(null)}
                        />
                    )}

                </div>
            </main>
        </div>
    )
}
