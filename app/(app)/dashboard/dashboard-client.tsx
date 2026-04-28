'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, AlertTriangle, Shield, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EventSelector } from "@/components/pages/dashboard/event-selector"
import { SimulationStats } from "@/components/pages/dashboard/simulation-stats"
import { BetCard } from "@/components/pages/dashboard/bet-card"
import { FightTable } from "@/components/pages/dashboard/fight-table"
import { FightBreakdown } from "@/components/pages/dashboard/fight-breakdown"
import { getEventFights } from "./actions"
import { getSavedBetIds } from "@/app/(app)/saved/actions"
import { Fight, SimulationBet, FightBreakdown as FightBreakdownModel } from "./d-types"
import { formatOdds } from "@/lib/odds/utils"
import { BetCardSkeleton } from "@/components/skeletons/bet-card-skeleton"
import { BetFilters, BetFiltersState, DEFAULT_FILTERS } from "@/components/pages/dashboard/bet-filters"

interface DashboardClientProps {
  initialEvents: Array<{ eventId: string; name: string; dateTime: string | null; venue: string | null; fightCount?: number }>
  userOddsFormat?: string
  thresholds?: {
    MIN_MAF_PROB: number
    MIN_EDGE_PCT: number
    MIN_AGENT_CONSENSUS_PASS_RATE: number
    BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW: number
  }
}

function formatRelativeCompletion(date: Date): string {
  const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (sec < 5) return "just now"
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

export default function DashboardClient({ initialEvents, userOddsFormat = "american", thresholds }: DashboardClientProps) {
  const MIN_MAF_PROB = thresholds?.MIN_MAF_PROB ?? 0.55
  const MIN_AGENT_CONSENSUS_PASS_RATE = thresholds?.MIN_AGENT_CONSENSUS_PASS_RATE ?? 0.6
  const MIN_EDGE_PCT = thresholds?.MIN_EDGE_PCT ?? 0.5
  const BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW = thresholds?.BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW ?? 0.55
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0]?.eventId || "")
  const [showResults, setShowResults] = useState(false)
  const [selectedFight, setSelectedFight] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [lastCompletedAt, setLastCompletedAt] = useState<Date | null>(null)

  // Results State
  const [simulatedBets, setSimulatedBets] = useState<SimulationBet[]>([])
  const [simulatedBreakdowns, setSimulatedBreakdowns] = useState<Record<string, FightBreakdownModel>>({})
  const [activeFights, setActiveFights] = useState<Fight[]>([])
  const [statusMessage, setStatusMessage] = useState("")
  // Markets scanned is derived from allBets.length below; this ref is kept only
  // for any legacy "scan_summary" event the server may still emit.
  const [serverMarketsScanned, setServerMarketsScanned] = useState(0)

  const [betSeed, setBetSeed] = useState(0)
  const [isResimulating, setIsResimulating] = useState(false)

  const [expandedBetIdx, setExpandedBetIdx] = useState<number | null>(null)
  const [showFilteredBets, setShowFilteredBets] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [betFilters, setBetFilters] = useState<BetFiltersState>(DEFAULT_FILTERS)
  const [savedBetIds, setSavedBetIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    getSavedBetIds()
      .then((ids) => {
        if (!cancelled) setSavedBetIds(new Set(ids))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (scanComplete) {
      const timer = setTimeout(() => {
        setScanComplete(false)
        router.refresh() // Refresh server components (sidebar history)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [scanComplete, router])

  const handleRunCard = async () => {
    if (!selectedEvent) return

    setIsScanning(true)
    setShowResults(true)
    setSimulatedBets([])
    setSimulatedBreakdowns({})
    setServerMarketsScanned(0)
    setStatusMessage("Initializing simulation...")

    try {
      // 1. Fetch fights for event
      const dbFights = await getEventFights(selectedEvent)

      // Update UI Fights List immediately
      const uiFights: Fight[] = dbFights.map(f => ({
        id: f.fightId,
        matchup: `${f.fighter1?.firstName || ""} ${f.fighter1?.lastName || ""} vs ${f.fighter2?.firstName || ""} ${f.fighter2?.lastName || ""}`,
        odds: "Analysing..." // We'll get lines from the agent stream
      }))
      setActiveFights(uiFights)

      // 2. Prepare Payload
      const eventName = initialEvents.find(e => e.eventId === selectedEvent)?.name || "Unknown Event"
      const payload = {
        data: {
          EventId: selectedEvent,
          Name: eventName,
          Fights: dbFights.map(f => ({
            FightId: f.fightId, // Pass as string, do not parse
            Fighters: [
              { FighterId: f.fighter1?.id, FirstName: f.fighter1?.firstName, LastName: f.fighter1?.lastName },
              { FighterId: f.fighter2?.id, FirstName: f.fighter2?.firstName, LastName: f.fighter2?.lastName }
            ]
          }))
        }
      }

      // 3. Call API Stream
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || "Failed to start simulation");
      }

      if (!response.body) throw new Error("Failed to start simulation")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let processedCount = 0
      const totalFights = dbFights.length || 1

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.replace("data: ", "")
            if (!jsonStr.trim()) continue

            try {
              const data = JSON.parse(jsonStr)

              if (data.type === "fight") {
                processedCount++

                const fightIdStr = data.fightId.toString()

                // Add Bet — sanitize numerics (server NaN serializes to null in JSON)
                const safeNum = (v: any, fallback = 0) => (typeof v === 'number' && isFinite(v) ? v : fallback)
                const sanitizedEdge = {
                  ...data.edge,
                  edge_pct: safeNum(data.edge?.edge_pct, 0),
                  P_sim: safeNum(data.edge?.P_sim, 0),
                  P_imp: safeNum(data.edge?.P_imp, 0),
                  confidencePct: safeNum(data.edge?.confidencePct, 0),
                  stability_score: safeNum(data.edge?.stability_score, 0),
                }
                setSimulatedBets(prev => [...prev, sanitizedEdge])

                // Add Breakdown (ensure key is string) — merge oddsHistory from edge
                setSimulatedBreakdowns(prev => ({
                  ...prev,
                  [fightIdStr]: {
                    ...data.breakdown,
                    oddsHistory: data.edge?.oddsHistory || data.breakdown?.oddsHistory || [],
                  }
                }))

                // Update activeFights with real odds (prefer full market line from breakdown)
                setActiveFights(prev => prev.map(f => {
                  if (f.id === fightIdStr) {
                    let displayOdds = "N/A"
                    if (data.breakdown?.marketLine) {
                      displayOdds = data.breakdown.marketLine
                        .split("/")
                        .map((part: string) => part.includes(":") ? part.split(":").pop()?.trim() || part : part.trim())
                        .join(" / ")
                    } else if (data.edge?.odds_american) {
                      displayOdds = data.edge.odds_american
                    }
                    return { ...f, odds: displayOdds }
                  }
                  return f
                }))

              } else if (data.type === "fight_error") {
                // Handle fight analysis errors — update display so it doesn't stay "Analysing..."
                const errorFightId = data.fightId?.toString()
                if (errorFightId) {
                  setActiveFights(prev => prev.map(f =>
                    f.id === errorFightId ? { ...f, odds: "Error" } : f
                  ))
                }
              } else if (data.type === "status") {
                setStatusMessage(data.message)
              } else if (data.type === "scan_summary") {
                setServerMarketsScanned(typeof data.marketsScanned === "number" ? data.marketsScanned : 0)
              } else if (data.type === "complete") {
                // When complete, ensure any remaining "Analysing..." fights show "N/A"
                setActiveFights(prev => prev.map(f =>
                  f.odds === "Analysing..." ? { ...f, odds: "N/A" } : f
                ))
                setScanComplete(true)
                setLastCompletedAt(new Date())
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e)
            }
          }
        }
      }

    } catch (error) {
      console.error("Simulation failed:", error)
      const msg = error instanceof Error ? error.message : "Simulation failed. Please try again."

      if (msg.includes("Free limit reached")) {
        setIsScanning(false)
        setShowResults(false) // Hide the results/loading view
        setShowLimitModal(true)
        return // Stop execution here
      }

      setStatusMessage(msg)
    } finally {
      setIsScanning(false)
      // Transition to results if we got anything
      // We rely on 'scanComplete' logic in handleSimulationComplete usually
    }
  }


  const handleRegenerateBets = () => {
    if (simulatedBets.length === 0) return

    setIsResimulating(true)

    // "Soft Re-simulation": Perturb the probabilistic outcomes slightly to simulate a new run
    // This provides fresh scenarios without needing a full backend re-fetch (preserving odds)
    setTimeout(() => {
      setSimulatedBets(prevBets => prevBets.map(bet => {
        // 1. Derive implied prob from existing edge/sim
        const pImp = bet.P_sim / (1 + (bet.edge_pct / 100))

        // 2. Perturb P_sim by up to +/- 2.5% (stochastic variance)
        const variance = (Math.random() * 0.05) - 0.025
        let newPSim = Math.min(0.99, Math.max(0.01, bet.P_sim + variance))

        // 3. Recalculate Edge
        const newEdge = ((newPSim - pImp) / pImp) * 100

        // 4. Adjust confidence & derived variance dynamically
        const newConfidence = Math.min(100, Math.max(10, bet.confidencePct + Math.floor(Math.random() * 12 - 6)))

        let newVarianceTag = bet.varianceTag
        // If the simulation solidifies on a result (high confidence), variance/volatility effectively drops
        if (newConfidence >= 80) newVarianceTag = "low"
        else if (newConfidence >= 65 && newVarianceTag === "high") newVarianceTag = "medium"
        else if (newConfidence < 50) newVarianceTag = "high"

        return {
          ...bet,
          P_sim: newPSim,
          edge_pct: newEdge,
          confidencePct: newConfidence,
          varianceTag: newVarianceTag
        }
      }))

      setBetSeed(prev => prev + 1)
      setIsResimulating(false)
    }, 2500)
  }

  const qualifyBets = (bets: SimulationBet[]): SimulationBet[] => {
    return bets.map((bet) => {
      const rejectReasons: string[] = []
      // Optional safety check if fields are missing in early bits
      const agentSignals = bet.agentSignals || []
      // Count "neutral" as half-pass: neutral means "no concern", not "fail".
      // Treating it as 0 makes the gate unrealistically harsh (2 pass + 1 neutral
      // would score 66%, while the model considered that a green light).
      const weightedPassSum = agentSignals.reduce(
        (sum, s) => sum + (s.signal === "pass" ? 1 : s.signal === "neutral" ? 0.5 : 0),
        0,
      )
      const agentPassRate = agentSignals.length > 0 ? weightedPassSum / agentSignals.length : 0

      // Explicit Model Rejection (Signal from Agent)
      // A genuine "no edge found" signal needs BOTH zero confidence AND zero edge —
      // confidencePct alone often hits 0 on conservative model output even when
      // edge_pct is materially positive (the engine derives confidence later).
      if (bet.confidencePct === 0 && Math.abs(bet.edge_pct) < MIN_EDGE_PCT) {
        rejectReasons.push("Model determined no value/edge found")
      }

      if (bet.P_sim < MIN_MAF_PROB) {
        rejectReasons.push(`Win probability ${(bet.P_sim * 100).toFixed(0)}% below ${MIN_MAF_PROB * 100}% threshold`)
      }
      if (bet.edge_pct < MIN_EDGE_PCT) {
        rejectReasons.push(`Edge ${bet.edge_pct.toFixed(1)}% below ${MIN_EDGE_PCT}% minimum`)
      }
      // Agent consensus: skip the gate when edge is large enough that we trust
      // the math over agent voting noise. Two passes + one neutral scores 0.83
      // (passes), but two neutrals + one pass scores 0.67 — the same fight gets
      // classified differently depending on neutral count, which the model emits
      // inconsistently. Only enforce when edge is marginal.
      const HIGH_EDGE_OVERRIDE = 5 // %
      if (bet.edge_pct < HIGH_EDGE_OVERRIDE && agentPassRate < MIN_AGENT_CONSENSUS_PASS_RATE) {
        rejectReasons.push(
          `Agent consensus ${(agentPassRate * 100).toFixed(0)}% below ${MIN_AGENT_CONSENSUS_PASS_RATE * 100}% threshold`,
        )
      }
      if (bet.varianceTag === "high" && bet.confidencePct / 100 < BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW) {
        rejectReasons.push(
          `High variance blocked: confidence ${bet.confidencePct}% below ${BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW * 100}%`,
        )
      }

      // Filter "No Bet" / "Pass" outcomes — but only when there's no material edge.
      // The engine already promotes No-Bet picks to ML when marketEvaluations.ML
      // shows >=3% edge, so any No-Bet that survived to here AND has real edge
      // is something we want to surface, not hide.
      const isNoBetLabel =
        bet.label === "No Bet" ||
        bet.label === "Pass" ||
        bet.bet_type === "No Bet" ||
        bet.label.toLowerCase().includes("no bet")
      if (isNoBetLabel && bet.edge_pct < MIN_EDGE_PCT) {
        rejectReasons.push("Model recommends passing on this fight")
      }

      // Explicitly filter fights where NO odds at all are tracked (neither the
      // recommended prop market nor the moneyline fallback). If only the specific
      // prop column is missing but ML is shown as fallback, don't nag — the user
      // can see the ML in the card.
      const hasNoOddsAtAll =
        bet.odds_american === "No odds available" ||
        bet.odds_american === "N/A" ||
        bet.odds_american === "0"
      if (hasNoOddsAtAll) {
        rejectReasons.push("No market odds tracked for this fight")
      }

      return {
        ...bet,
        status: rejectReasons.length === 0 ? "qualified" : "filtered",
        rejectReasons,
      }
    })
  }

  // Use dynamic state instead of static eventData
  const currentFights = activeFights
  const fightBreakdowns = simulatedBreakdowns

  const allBets = qualifyBets(simulatedBets)


  // Helper: check if a bet has real odds (not "No odds available")
  const hasRealOdds = (b: SimulationBet) =>
    b.odds_american !== "No odds available" &&
    b.odds_american !== "N/A" &&
    b.odds_american !== "0"

  // Restore 3e4049b display behavior: show both qualified AND filtered bets that
  // have real odds and aren't "No Bet" — the strict gates reject too many bets to
  // only surface qualified ones, so filtered bets with real odds also appear here.
  const sortedQualifiedBets = allBets
    .filter((b) => b.status === "qualified" && hasRealOdds(b) && b.bet_type !== "No Bet")
    .sort((a, b) => b.edge_pct - a.edge_pct)

  const sortedFilteredBets = allBets
    .filter((b) => b.status === "filtered")
    .sort((a, b) => b.edge_pct - a.edge_pct)

  const allTopBets = [
    ...sortedQualifiedBets,
    ...sortedFilteredBets.filter(
      (b) =>
        hasRealOdds(b) &&
        b.label !== "No Bet" &&
        b.label !== "Pass" &&
        b.bet_type !== "No Bet" &&
        !b.label.toLowerCase().includes("no bet"),
    ),
  ]

  // Apply user filters
  const applyUserFilters = (bets: typeof allTopBets) => {
    return bets.filter(bet => {
      // Bet type filter
      if (!betFilters.betTypes.includes("ALL")) {
        if (!betFilters.betTypes.includes(bet.bet_type)) return false
      }

      // Min probability filter
      if (betFilters.minProbability > 0) {
        if ((bet.P_sim * 100) < betFilters.minProbability) return false
      }

      // Variance filter
      if (!betFilters.varianceLevels.includes(bet.varianceTag)) return false

      // Min edge filter
      if (betFilters.minEdge > 0) {
        if (bet.edge_pct < betFilters.minEdge) return false
      }

      return true
    })
  }

  // Sort: Probability (desc) → Variance (low first) → Edge (desc)
  const varianceOrder: Record<string, number> = { low: 0, medium: 1, high: 2 }
  const sortBets = (bets: typeof allTopBets) => {
    return [...bets].sort((a, b) => {
      // 1. Probability descending
      const probDiff = b.P_sim - a.P_sim
      if (Math.abs(probDiff) > 0.02) return probDiff

      // 2. Variance ascending (low first)
      const varDiff = (varianceOrder[a.varianceTag] ?? 1) - (varianceOrder[b.varianceTag] ?? 1)
      if (varDiff !== 0) return varDiff

      // 3. Edge descending
      return b.edge_pct - a.edge_pct
    })
  }

  const topBets = sortBets(applyUserFilters(allTopBets))

  // Remaining: fights with no odds or explicit "No Bet" go to the collapsible section
  const topBetIds = new Set(topBets.map(b => b.id))
  const filteredBets = allBets.filter(b => !topBetIds.has(b.id))

  const avgConfidence =
    topBets.length > 0 ? topBets.reduce((sum, b) => sum + b.confidencePct, 0) / topBets.length : 0
  const avgEdge =
    topBets.length > 0 ? topBets.reduce((sum, b) => sum + b.edge_pct, 0) / topBets.length : 0

  // Use majority-based variance instead of "any one high = all high"
  const varianceCounts = { low: 0, medium: 0, high: 0 }
  topBets.forEach(b => { varianceCounts[b.varianceTag] = (varianceCounts[b.varianceTag] || 0) + 1 })
  const majorityVariance = varianceCounts.high > topBets.length / 2
    ? "High"
    : varianceCounts.low > topBets.length / 2
      ? "Low"
      : "Medium"

  // Risk level based on confidence and majority variance — use reasonable thresholds
  const riskLevel: "Low" | "Medium" | "High" =
    avgConfidence < 40 || majorityVariance === "High" ? "High"
      : avgConfidence < 55 || majorityVariance === "Medium" ? "Medium"
        : "Low"

  return (
    <div className="min-h-fit premium-bg overflow-y-hidden neural-bg font-sans selection:bg-primary/30 pb-20">

      <div className="hero-orb" />
      <div className="hero-orb-secondary" />
      {/* <div className="scanlines" /> */}

      {/* Particles */}
      <div className="particle" style={{ left: "10%", animationDelay: "0s" }} />
      <div className="particle" style={{ left: "20%", animationDelay: "2s" }} />
      <div className="particle" style={{ left: "35%", animationDelay: "4s" }} />
      <div className="particle" style={{ left: "55%", animationDelay: "1s" }} />
      <div className="particle" style={{ left: "70%", animationDelay: "3s" }} />
      <div className="particle" style={{ left: "85%", animationDelay: "5s" }} />
      <div className="particle" style={{ left: "95%", animationDelay: "2.5s" }} />

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        {/* Compact Hero */}
        <div className="text-center pt-2 pb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 flex-wrap">
            <div className="live-indicator">
              <div className="live-dot" />
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Live</span>
            </div>
            <span className="text-xs text-muted-foreground/50 hidden sm:inline">|</span>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary/70 font-medium">
              MMA Analytics Platform
            </p>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight hero-title mb-3 text-white px-2">
            Multi-Agent Fight Simulator
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
            AI-powered analysis using multi-agent simulation to model outcomes and identify statistical patterns.
          </p>
        </div>

        {/* Event Selector */}
        <EventSelector
          selectedEventId={selectedEvent}
          onSelectEvent={(val) => {
            setSelectedEvent(val)
            setShowResults(false)
            setSelectedFight(null)
          }}
          isScanning={isScanning}
          scanComplete={scanComplete}
          onRunSimulation={handleRunCard}
          events={initialEvents}
        />

        {/* Results Section */}
        {showResults && (
          <div className="space-y-12">

            {/* Top Simulated Outcomes Section - Intelligence Engine UI */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-white tracking-tight">MAFS AI Picks</h2>
                            <div className="px-3 py-1 bg-emerald-500/[0.05] border border-emerald-500/20 rounded-full flex items-center">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{topBets.length} HIGH-EDGE OPPORTUNIT{topBets.length === 1 ? 'Y' : 'IES'} DETECTED</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground/60 text-sm mb-3 font-medium">Highest-edge opportunities identified by the MAFS simulation engine.</p>
                        {!isScanning && lastCompletedAt && topBets.length > 0 ? (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                <p className="text-[11px] text-emerald-400/80 font-medium">
                                    Simulation complete — {formatRelativeCompletion(lastCompletedAt)}
                                </p>
                            </div>
                        ) : isScanning ? (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <p className="text-[11px] text-amber-400/80 font-medium">{statusMessage || "Simulation in progress…"}</p>
                            </div>
                        ) : null}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateBets}
                        disabled={isScanning || isResimulating}
                        className="text-xs border-white/10 hover:border-primary/30 bg-transparent text-gray-300 mt-1"
                    >
                        {isResimulating ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Running...
                            </>
                        ) : "Re-simulate"}
                    </Button>
                </div>
              </div>

              {/* Filter Bar */}
              {!isScanning && allTopBets.length > 0 && (
                <BetFilters
                  filters={betFilters}
                  onChange={setBetFilters}
                  totalCount={allTopBets.length}
                  filteredCount={topBets.length}
                />
              )}

              {isResimulating ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: Math.max(topBets.length, 3) }, (_, i) => i + 1).map((i) => (
                    <BetCardSkeleton key={i} />
                  ))}
                </div>
              ) : topBets.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topBets.map((bet, idx) => {
                    const currentEvent = initialEvents.find(e => e.eventId === selectedEvent)
                    return (
                      <BetCard
                        key={`${betSeed}-${bet.id}`}
                        bet={bet}
                        index={idx}
                        isExpanded={expandedBetIdx === idx}
                        onToggle={() => setExpandedBetIdx(expandedBetIdx === idx ? null : idx)}
                        betSeed={betSeed}
                        oddsFormat={userOddsFormat}
                        eventId={selectedEvent}
                        eventName={currentEvent?.name}
                        initiallySaved={savedBetIds.has(bet.id)}
                        lastCompletedAt={lastCompletedAt}
                      />
                    )
                  })}
                </div>
              ) : isScanning ? (
                <div className="flex flex-col items-center justify-center p-12 border border-white/5 rounded-lg bg-black/20">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  </div>
                  <span className="text-muted-foreground text-sm mt-3 animate-pulse">Analyzing matchups...</span>
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

            {!isScanning && simulatedBets.length > 0 && (
              <SimulationStats
                qualifiedBets={topBets}
                avgConfidence={avgConfidence}
                avgEdge={avgEdge}
                riskLevel={riskLevel}
                simulationKey={betSeed}
                marketsScanned={serverMarketsScanned > 0 ? serverMarketsScanned : allBets.length}
              />
            )}

            {filteredBets.length > 0 && (
              <section className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <button
                  onClick={() => setShowFilteredBets(!showFilteredBets)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-primary/40 bg-black/40 hover:bg-black/50 hover:border-primary/60 transition-all group"
                >
                  <span className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Markets Analyzed but No Bets Found ({filteredBets.length})
                  </span>
                  {showFilteredBets ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <p className="text-xs text-muted-foreground/60 mt-2 ml-1">
                  These markets were analyzed by the engine but didn't meet edge, probability, or consensus thresholds — no bets were surfaced.
                </p>

                {showFilteredBets && (
                  <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {filteredBets.map((bet) => {
                      // Determine Pass/Fail status for indicators
                      const passProb = bet.P_sim >= MIN_MAF_PROB
                      const passEdge = bet.edge_pct >= MIN_EDGE_PCT

                      const agentSignals = bet.agentSignals || []
                      const passCount = agentSignals.filter((s) => s.signal === "pass").length
                      const agentPassRate = agentSignals.length > 0 ? passCount / agentSignals.length : 0
                      const passMatchup = agentPassRate >= MIN_AGENT_CONSENSUS_PASS_RATE

                      const isHighVariance = bet.varianceTag === "high"
                      const sufficientConfidence = bet.confidencePct / 100 >= BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW
                      const passRisk = !(isHighVariance && !sufficientConfidence)

                      return (
                        <Card key={bet.id} className="bg-black/30 border-white/5">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2 gap-3">
                              <div className="min-w-0 flex-1">
                                {bet.fight && (
                                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80 mb-1.5 truncate">
                                    {bet.fight}
                                  </p>
                                )}
                                <p className="font-medium text-white/70 text-sm">{bet.label}</p>
                                <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">
                                  {formatOdds(bet.odds_american, userOddsFormat)}
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {(bet as any).oddsContext === "moneyline-fallback" && (
                                    <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground/50">(ML)</span>
                                  )}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                                No edge found
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3 mb-4">
                              {bet.rejectReasons?.map((reason, rIdx) => (
                                <span key={rIdx} className="text-[10px] sm:text-xs text-amber-400/90 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/10">
                                  {reason}
                                </span>
                              ))}
                            </div>

                            {/* Status Indicators Row */}
                            <div className="flex flex-wrap items-center gap-4 text-[10px] sm:text-xs font-medium border-t border-white/5 pt-3">

                              <span className={passProb ? "text-emerald-400" : "text-red-400/80"}>
                                {passProb ? "+Model Probability" : "-Model Probability"}
                              </span>

                              <span className={passEdge ? "text-emerald-400" : "text-red-400/80"}>
                                {passEdge ? "+Market Efficiency" : "-Market Efficiency"}
                              </span>

                              <span className={passMatchup ? "text-emerald-400" : "text-red-400/80"}>
                                {passMatchup ? "+Matchup Fit" : "-Matchup Fit"}
                              </span>

                              <span className={passRisk ? "text-emerald-400" : "text-red-400/80"}>
                                {passRisk ? "~Risk Filters" : "!Risk Filters"}
                              </span>

                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            <FightTable
              fights={currentFights}
              selectedFightId={selectedFight}
              onSelectFight={setSelectedFight}
              oddsFormat={userOddsFormat}
            />

            {selectedFight && fightBreakdowns[selectedFight] && (
              <FightBreakdown
                breakdown={fightBreakdowns[selectedFight]}
                matchup={currentFights.find(f => f.id === selectedFight)?.matchup}
                onClose={() => setSelectedFight(null)}
              />
            )}
          </div>
        )
        }
      </main>

      <AlertDialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
          <AlertDialogHeader>
            <div className="mx-auto bg-amber-500/10 p-3 rounded-full mb-4 w-fit">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl text-center font-bold">Analysis Limit Reached</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              You've used all your free analysis runs. Upgrade to Pro to unlock unlimited simulations and gain a winning edge.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => router.push('/billing')}
              className="w-full bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 font-semibold"
            >
              Upgrade to Pro Now
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowLimitModal(false)}
              className="w-full text-muted-foreground hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

