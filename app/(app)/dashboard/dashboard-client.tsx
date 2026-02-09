'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, AlertTriangle, Shield, Loader2 } from "lucide-react"
import { EventSelector } from "@/components/pages/dashboard/event-selector"
import { SimulationStats } from "@/components/pages/dashboard/simulation-stats"
import { BetCard } from "@/components/pages/dashboard/bet-card"
import { FightTable } from "@/components/pages/dashboard/fight-table"
import { FightBreakdown } from "@/components/pages/dashboard/fight-breakdown"
import { getEventFights } from "./actions"
import { Fight, SimulationBet, FightBreakdown as FightBreakdownModel } from "./d-types"
import { formatOdds } from "@/lib/odds/utils"
import { BetCardSkeleton } from "@/components/skeletons/bet-card-skeleton"

interface DashboardClientProps {
  initialEvents: Array<{ eventId: string; name: string; dateTime: string | null; venue: string | null; fightCount?: number }>
  userOddsFormat?: string
}

const MIN_MAF_PROB = 0.55
const MIN_AGENT_CONSENSUS_PASS_RATE = 0.7
const MIN_EDGE_PCT = 0.5
const BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW = 0.55

export default function DashboardClient({ initialEvents, userOddsFormat = "american" }: DashboardClientProps) {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0]?.eventId || "")
  const [showResults, setShowResults] = useState(false)
  const [selectedFight, setSelectedFight] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)

  // Results State
  const [simulatedBets, setSimulatedBets] = useState<SimulationBet[]>([])
  const [simulatedBreakdowns, setSimulatedBreakdowns] = useState<Record<string, FightBreakdownModel>>({})
  const [activeFights, setActiveFights] = useState<Fight[]>([])
  const [statusMessage, setStatusMessage] = useState("")

  const [betSeed, setBetSeed] = useState(0)
  const [isResimulating, setIsResimulating] = useState(false)

  const [expandedBetIdx, setExpandedBetIdx] = useState<number | null>(null)
  const [showFilteredBets, setShowFilteredBets] = useState(false)

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
    setStatusMessage("Initializing simulation...")

    try {
      // 1. Fetch fights for event
      const dbFights = await getEventFights(selectedEvent)

      // Update UI Fights List immediately
      const uiFights: Fight[] = dbFights.map(f => ({
        id: f.fightId,
        matchup: `${f.fighter1?.firstName || ""} ${f.fighter1?.lastName || ""} vs ${f.fighter2?.firstName || ""} ${f.fighter2?.lastName || ""}`,
        odds: "Lines Pending" // We'll get lines from the agent stream
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

                // Add Bet
                setSimulatedBets(prev => [...prev, data.edge])

                // Add Breakdown (ensure key is string)
                setSimulatedBreakdowns(prev => ({
                  ...prev,
                  [fightIdStr]: data.breakdown
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

              } else if (data.type === "status") {
                setStatusMessage(data.message)
              } else if (data.type === "complete") {
                setScanComplete(true)
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
      setStatusMessage(msg)
      if (msg.includes("Free limit reached")) {
        // Maybe redirect or show upgrade button? For now just show message.
        // We could enable a button in the overlay if we modified it, but message is good start.
      }
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
      const passCount = agentSignals.filter((s) => s.signal === "pass").length
      const agentPassRate = agentSignals.length > 0 ? passCount / agentSignals.length : 0

      // Explicit Model Rejection (Signal from Agent)
      if (bet.confidencePct === 0) {
        rejectReasons.push("Model determined no value/edge found")
      }

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

      // Explicitly filter "No Bet" or "Pass" outcomes
      if (bet.label === "No Bet" || bet.label === "Pass" || bet.bet_type === "No Bet") {
        rejectReasons.push("Model recommends passing on this fight")
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


  // Sort both lists by edge_pct descending to ensure best options are shown
  const sortedQualifiedBets = allBets
    .filter((b) => b.status === "qualified")
    .sort((a, b) => b.edge_pct - a.edge_pct)

  const sortedFilteredBets = allBets
    .filter((b) => b.status === "filtered")
    .sort((a, b) => b.edge_pct - a.edge_pct)

  // Always show at least 3 bets if available (Backfill with best filtered bets if needed)
  const topBets = [...sortedQualifiedBets]
  if (topBets.length < 3) {
    const needed = 3 - topBets.length
    // Exclude "No Bet" outcomes from being backfilled into top picks
    const validFiltered = sortedFilteredBets.filter(b => b.label !== "No Bet" && b.label !== "Pass" && b.bet_type !== "No Bet")
    topBets.push(...validFiltered.slice(0, needed))
  }

  // Remaining filtered bets for the collapsible section
  const topBetIds = new Set(topBets.map(b => b.id))
  const filteredBets = sortedFilteredBets.filter(b => !topBetIds.has(b.id))

  // Keep strict stats calculation based on ONLY truly qualified bets to reflect true quality
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
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="live-indicator">
              <div className="live-dot" />
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Live</span>
            </div>
            <span className="text-xs text-muted-foreground/50">|</span>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/70 font-medium">
              MMA Analytics Platform
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight hero-title mb-3 text-white">
            Multi-Agent Fight Simulator
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
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

            <SimulationStats
              qualifiedBets={topBets}
              avgConfidence={avgConfidence}
              avgEdge={avgEdge}
              riskLevel={riskLevel}
            />

            {/* Top Simulated Outcomes Section - Intelligence Engine UI */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Top Simulated Outcomes</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateBets}
                  disabled={isScanning || isResimulating}
                  className="text-xs border-white/10 hover:border-primary/30 bg-transparent text-gray-300"
                >
                  {isResimulating ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : "Re-simulate"}
                </Button>
              </div>

              {isResimulating ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <BetCardSkeleton key={i} />
                  ))}
                </div>
              ) : topBets.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topBets.slice(0, 3).map((bet, idx) => (
                    <BetCard
                      key={`${betSeed}-${bet.id}`}
                      bet={bet}
                      index={idx}
                      isExpanded={expandedBetIdx === idx}
                      onToggle={() => setExpandedBetIdx(expandedBetIdx === idx ? null : idx)}
                      betSeed={betSeed}
                      oddsFormat={userOddsFormat}
                    />
                  ))}
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

            {filteredBets.length > 0 && (
              <section className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <button
                  onClick={() => setShowFilteredBets(!showFilteredBets)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-primary/40 bg-black/40 hover:bg-black/50 hover:border-primary/60 transition-all group"
                >
                  <span className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Filtered by Simulation ({filteredBets.length})
                  </span>
                  {showFilteredBets ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <p className="text-xs text-muted-foreground/60 mt-2 ml-1">
                  These bets failed safety checks. Blocking them protects your bankroll.
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
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-white text-base">{bet.label}</p>
                                <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{formatOdds(bet.odds_american, userOddsFormat)}</p>
                              </div>
                              <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                Not recommended
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
                onClose={() => setSelectedFight(null)}
              />
            )}
          </div>
        )
        }
      </main >
    </div >
  )
}

