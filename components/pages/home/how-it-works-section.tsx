"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  Brain, Zap, Target, Activity, TrendingUp, Gauge, Shield,
  DollarSign, AlertTriangle, Play, RotateCcw,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FeaturedFightAgent {
  name: string
  prediction: string
  confidence: number
}

interface FeaturedFight {
  fightId: string
  eventName: string
  fighter1: { name: string; initials: string }
  fighter2: { name: string; initials: string }
  agents: FeaturedFightAgent[]
  consensus: { bet: string; odds: string; agreementPct: number }
}

interface SharpMoneyData {
  fighter: string
  odds: string
  sharpPct: number
  lineHistory: { time: string; odds: string }[]
}

interface HowItWorksSectionProps {
  featuredFight?: FeaturedFight | null
  sharpMoney?: SharpMoneyData | null
}

const AGENT_ICONS = [Zap, Target, Activity, TrendingUp, Brain, Gauge]

const FALLBACK_FIGHT: FeaturedFight = {
  fightId: "demo",
  eventName: "UFC Demo",
  fighter1: { name: "Topuria", initials: "IT" },
  fighter2: { name: "Makhachev", initials: "IM" },
  agents: [
    { name: "Striking",  prediction: "Topuria",   confidence: 72 },
    { name: "Grappling", prediction: "Makhachev", confidence: 81 },
    { name: "Cardio",    prediction: "Even",      confidence: 50 },
    { name: "Momentum",  prediction: "Topuria",   confidence: 68 },
    { name: "Fight IQ",  prediction: "Makhachev", confidence: 65 },
    { name: "Reach",     prediction: "Topuria",   confidence: 74 },
  ],
  consensus: { bet: "Topuria KO/TKO", odds: "+240", agreementPct: 67 },
}

function HowItWorksSection({ featuredFight, sharpMoney }: HowItWorksSectionProps) {
  const fight = featuredFight ?? FALLBACK_FIGHT
  const [activeAgent, setActiveAgent] = useState(-1)
  const [revealedCount, setRevealedCount] = useState(0)
  const [showConsensus, setShowConsensus] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const hasTriggered = useRef(false)

  const f1 = fight.fighter1.name
  const f2 = fight.fighter2.name

  // Sequential reveal animation — each agent "appears" one by one
  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true)
    setRevealedCount(0)
    setShowConsensus(false)
    setActiveAgent(-1)
    setHasPlayed(true)

    const totalAgents = fight.agents.length
    fight.agents.forEach((_, idx) => {
      setTimeout(() => {
        setRevealedCount(idx + 1)
        setActiveAgent(idx)
      }, 600 + idx * 500)
    })

    // After all agents revealed, show consensus
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowConsensus(true)
      // Start the cycling highlight after reveal completes
      setActiveAgent(0)
    }, 600 + totalAgents * 500 + 400)
  }, [fight.agents])

  // Trigger on scroll into view
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true
          runAnalysis()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [runAnalysis])

  // Cycle active agent AFTER initial reveal
  useEffect(() => {
    if (isAnalyzing || !hasPlayed) return
    const interval = setInterval(() => {
      setActiveAgent(prev => (prev + 1) % fight.agents.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [fight.agents.length, isAnalyzing, hasPlayed])

  const handleReplay = () => {
    hasTriggered.current = true
    runAnalysis()
  }

  // Determine active display index (hovered takes priority)
  const displayActive = hoveredAgent !== null ? hoveredAgent : activeAgent

  return (
    <section id="how-it-works" className="py-12 md:py-18 px-4 relative scroll-section">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_65%)]" />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 mb-4">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-wider">Your AI army</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-balance tracking-tight">
            8 AI agents <span className="text-primary">working 24/7</span>
          </h2>
          <p className="text-lg text-foreground/70 text-pretty mb-1">
            Running <span className="text-primary font-semibold">847,000 simulations</span> per fight.
          </p>
          <p className="text-sm text-foreground/50">
            <span className="text-primary font-semibold">When they all agree, you pounce.</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Agent Analysis Terminal */}
          <Card className="terminal-card analysis-terminal" ref={sectionRef}>
            <CardContent className="p-6">
              {/* Fighter Visuals */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
                <div className="flex flex-col items-center gap-2">
                  <div className={`h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary transition-all duration-500 ${isAnalyzing ? 'animate-pulse' : ''}`}>
                    {fight.fighter1.initials}
                  </div>
                  <span className="text-sm font-semibold">{f1}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold text-muted-foreground/50">VS</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-pulse' : 'bg-primary animate-pulse'}`} />
                    <span className={`text-xs font-mono ${isAnalyzing ? 'text-amber-400' : 'text-primary'}`}>
                      {isAnalyzing ? 'ANALYZING' : 'COMPLETE'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className={`h-16 w-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-400 transition-all duration-500 ${isAnalyzing ? 'animate-pulse' : ''}`}>
                    {fight.fighter2.initials}
                  </div>
                  <span className="text-sm font-semibold">{f2}</span>
                </div>
              </div>

              {/* Agent Rows — Revealed Sequentially */}
              <div className="space-y-1.5">
                {fight.agents.map((agent, idx) => {
                  const Icon = AGENT_ICONS[idx % AGENT_ICONS.length]
                  const isRevealed = idx < revealedCount
                  const isActive = displayActive === idx
                  const colorClass =
                    agent.prediction === f1 ? "text-primary" :
                    agent.prediction === f2 ? "text-blue-400" : "text-muted-foreground"
                  const barClass =
                    agent.prediction === f1 ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" :
                    agent.prediction === f2 ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-muted-foreground"

                  return (
                    <div
                      key={agent.name}
                      onMouseEnter={() => setHoveredAgent(idx)}
                      onMouseLeave={() => setHoveredAgent(null)}
                      onClick={() => setActiveAgent(idx)}
                      className={`agent-row flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all duration-300 ${
                        !isRevealed
                          ? "opacity-0 translate-y-2"
                          : isActive
                            ? "bg-primary/10 border-primary/30 scale-[1.02]"
                            : "bg-background/30 border-transparent hover:bg-background/50 opacity-100 translate-y-0"
                      }`}
                      style={{
                        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isActive ? "bg-primary/20 scale-110" : "bg-muted"
                      }`}>
                        <Icon className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground/90">{agent.name}</span>
                          <span className={`text-sm font-bold transition-all duration-300 ${colorClass} ${isActive ? 'scale-110' : ''}`}>
                            {isRevealed ? agent.prediction : '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
                              style={{ width: isRevealed ? `${agent.confidence}%` : '0%' }}
                            />
                          </div>
                          <span className={`text-xs font-mono font-semibold text-foreground/70 tabular-nums transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                            {agent.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Consensus — Fades In After All Agents */}
              <div className={`mt-5 p-4 rounded-xl bg-primary/15 border border-primary/40 relative z-10 shadow-[0_0_30px_hsl(var(--primary)/0.25),inset_0_1px_0_hsl(var(--primary)/0.2)] transition-all duration-700 ${showConsensus ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)] rounded-xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">Consensus Pick</span>
                    <span className="text-xs text-primary font-bold">{fight.consensus.agreementPct}% agreement</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-foreground">{fight.consensus.bet}</span>
                    <span className="text-2xl font-mono font-black text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.6)' }}>{fight.consensus.odds}</span>
                  </div>
                </div>
              </div>

              {/* Replay Button */}
              {hasPlayed && !isAnalyzing && (
                <button
                  onClick={handleReplay}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border/30 bg-background/30 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-xs text-muted-foreground hover:text-primary group"
                >
                  <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
                  <span className="font-medium">Replay Analysis</span>
                </button>
              )}

              {/* Pre-analysis state */}
              {!hasPlayed && (
                <button
                  onClick={handleReplay}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/15 transition-all duration-300 text-sm text-primary group"
                >
                  <Play className="h-4 w-4 fill-primary/50" />
                  <span className="font-semibold">Run Analysis</span>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Sharp Money Panel */}
          <Card className="terminal-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Sharp Money Intelligence</h3>
              </div>

              {sharpMoney ? (
                <>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">Sharp Money Detected</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold">{sharpMoney.fighter}</span>
                      <span className="text-xl font-mono">{sharpMoney.odds}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${sharpMoney.sharpPct}%` }} />
                      </div>
                      <span className="text-sm font-bold text-blue-400">{sharpMoney.sharpPct}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">of sharp bettors backing this line</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Line Movement
                    </h4>
                    <div className="flex items-center justify-between">
                      {sharpMoney.lineHistory.map((point, idx) => (
                        <div key={idx} className="text-center">
                          <div className={`text-lg font-mono font-bold ${
                            idx === sharpMoney.lineHistory.length - 1 ? "text-primary" : "text-muted-foreground"
                          }`}>
                            {point.odds}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{point.time}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-muted/30 rounded-md p-3">
                      <div className="line-movement-bar" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                    <Shield className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No sharp action data yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-[240px]">
                    Line-movement intelligence appears here once books open markets for this fight.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3-step "How Users Win" block */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-black uppercase tracking-wider">Dead simple</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight">
              3 steps to <span className="text-primary">profitable betting</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />
            {[
              { n: 1, title: "Open MAFS", desc: "Access AI edge detection dashboard" },
              { n: 2, title: "View AI-detected edges", desc: "See probability gaps across 27+ sportsbooks" },
              { n: 3, title: "Bet only when edge exists", desc: "Place bets with mathematical advantage" },
            ].map(step => (
              <div key={step.n} className="text-center group">
                <div className="h-16 w-16 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-5 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/35 relative">
                  <span className="text-2xl font-bold text-primary">{step.n}</span>
                </div>
                <h4 className="font-semibold mb-2 tracking-tight transition-all duration-300 group-hover:text-primary text-lg">{step.title}</h4>
                <p className="text-sm text-muted-foreground/60">{step.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-10 text-muted-foreground/60 text-[15px]">
            Most users find their first profitable edge <span className="text-primary font-semibold">within minutes</span>.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
