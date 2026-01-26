'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, AlertTriangle, Shield, Sparkles } from "lucide-react"
import { AISimulationOverlay } from "@/components/ai-simulation-overlay"
import { EventSelector } from "@/components/pages/dashboard/event-selector"
import { SimulationStats } from "@/components/pages/dashboard/simulation-stats"
import { BetCard } from "@/components/pages/dashboard/bet-card"
import { FightTable } from "@/components/pages/dashboard/fight-table"
import { FightBreakdown } from "@/components/pages/dashboard/fight-breakdown"
import { getEventFights } from "./actions"
import { Fight, SimulationBet, FightBreakdown as FightBreakdownModel } from "./d-types"

const MIN_MAF_PROB = 0.55
const MIN_AGENT_CONSENSUS_PASS_RATE = 0.7
const MIN_EDGE_PCT = 0.5
const BLOCK_HIGH_VARIANCE_IF_CONFIDENCE_BELOW = 0.55

interface DashboardClientProps {
  initialEvents: Array<{ eventId: string; name: string; dateTime: string | null; venue: string | null }>
}

export default function DashboardClient({ initialEvents }: DashboardClientProps) {
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

  const [isGeneratingBets, setIsGeneratingBets] = useState(false)
  const [betSeed, setBetSeed] = useState(0)
  const [expandedBetIdx, setExpandedBetIdx] = useState<number | null>(null)
  const [showFilteredBets, setShowFilteredBets] = useState(false)
  const [showSimulation, setShowSimulation] = useState(false)

  useEffect(() => {
    if (scanComplete) {
      const timer = setTimeout(() => {
        setShowSimulation(false)
        setIsScanning(false)
        setShowResults(true)
        setScanComplete(false)
        router.refresh() // Refresh server components (sidebar history)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [scanComplete, router])

  const handleRunCard = async () => {
    if (!selectedEvent) return

    setShowSimulation(true)
    setIsScanning(true)
    setShowResults(false)
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

      if (!response.ok || !response.body) throw new Error("Failed to start simulation")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

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
                    const displayOdds = data.breakdown?.marketLine || data.edge?.odds_american || "N/A"
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
      setStatusMessage("Simulation failed. Please try again.")
    } finally {
      setIsScanning(false)
      // Transition to results if we got anything
      // We rely on 'scanComplete' logic in handleSimulationComplete usually
    }
  }

  const handleSimulationComplete = () => {
    setShowSimulation(false)
    setIsScanning(false)
    setShowResults(true)
    setScanComplete(true)
    setTimeout(() => setScanComplete(false), 600)
  }

  const handleRegenerateBets = () => {
    setIsGeneratingBets(true)
    setBetSeed((prev) => prev + 1)
    setTimeout(() => {
      setIsGeneratingBets(false)
    }, 1000)
  }

  const qualifyBets = (bets: SimulationBet[]): SimulationBet[] => {
    return bets.map((bet) => {
      const rejectReasons: string[] = []
      // Optional safety check if fields are missing in early bits
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

  // Use dynamic state instead of static eventData
  const currentFights = activeFights
  const fightBreakdowns = simulatedBreakdowns

  const allBets = qualifyBets(simulatedBets)
  const qualifiedBets = allBets.filter((b) => b.status === "qualified")
  const filteredBets = allBets.filter((b) => b.status === "filtered")

  const avgConfidence =
    qualifiedBets.length > 0 ? qualifiedBets.reduce((sum, b) => sum + b.confidencePct, 0) / qualifiedBets.length : 0
  const avgEdge =
    qualifiedBets.length > 0 ? qualifiedBets.reduce((sum, b) => sum + b.edge_pct, 0) / qualifiedBets.length : 0
  const hasHighVariance = qualifiedBets.some((b) => b.varianceTag === "high")
  const riskLevel = hasHighVariance || avgConfidence < 55 ? "High" : avgConfidence < 62 ? "Medium" : "Low"

  return (
    <div className="min-h-fit premium-bg overflow-y-hidden neural-bg font-sans selection:bg-primary/30 pb-20">
      {/* AI Simulation Overlay */}
      <AISimulationOverlay isActive={showSimulation} message={statusMessage} />

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
              qualifiedBets={qualifiedBets}
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
                  disabled={isGeneratingBets}
                  className="text-xs border-white/10 hover:border-primary/30 bg-transparent text-gray-300"
                >
                  {isGeneratingBets ? "Re-simulate..." : "Re-simulate"}
                </Button>
              </div>

              {qualifiedBets.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {qualifiedBets.slice(0, 3).map((bet, idx) => (
                    <BetCard
                      key={`${betSeed}-${bet.id}`}
                      bet={bet}
                      index={idx}
                      isExpanded={expandedBetIdx === idx}
                      onToggle={() => setExpandedBetIdx(expandedBetIdx === idx ? null : idx)}
                      betSeed={betSeed}
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
                <p className="text-xs text-muted-foreground/60 mt-2 ml-1">
                  These bets failed safety checks. Blocking them protects your bankroll.
                </p>

                {showFilteredBets && (
                  <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {filteredBets.map((bet) => (
                      <Card key={bet.id} className="bg-black/30 border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-muted-foreground">{bet.label}</p>
                              <p className="text-xs text-muted-foreground/60 font-mono">{bet.odds_american}</p>
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
              fights={currentFights}
              selectedFightId={selectedFight}
              onSelectFight={setSelectedFight}
            />

            {selectedFight && fightBreakdowns[selectedFight] && (
              <FightBreakdown
                breakdown={fightBreakdowns[selectedFight]}
                onClose={() => setSelectedFight(null)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
