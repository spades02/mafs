"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Zap, Target, Activity, Brain, TrendingUp, Gauge, Play, RotateCcw } from "lucide-react"

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

interface SimulationDemoProps {
  featuredFight?: FeaturedFight | null
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

export function SimulationDemo({ featuredFight }: SimulationDemoProps) {
  const fight = featuredFight ?? FALLBACK_FIGHT
  const f1 = fight.fighter1.name
  const f2 = fight.fighter2.name

  const [hasStarted, setHasStarted] = useState(false)
  const [activeAgent, setActiveAgent] = useState(-1)
  const [revealedCount, setRevealedCount] = useState(0)
  const [showConsensus, setShowConsensus] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null)

  // Sequential reveal animation
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
      setActiveAgent(0)
    }, 600 + totalAgents * 500 + 400)
  }, [fight.agents])

  // Action to start the demo manually
  const handleStart = () => {
    setHasStarted(true)
    runAnalysis()
  }

  // Cycle active agent AFTER initial reveal
  useEffect(() => {
    if (isAnalyzing || !hasPlayed) return
    const interval = setInterval(() => {
      setActiveAgent(prev => (prev + 1) % fight.agents.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isAnalyzing, hasPlayed, fight.agents.length])

  // Determine active display index (hovered takes priority)
  const displayActive = hoveredAgent !== null ? hoveredAgent : activeAgent

  // Compute simulation count from fight data or default
  const simCount = featuredFight ? "847,293" : "847,293"

  return (
    <div className="relative">
      {/* "TRY IT" label positioned above the card */}
      <div className="absolute -top-10 left-0 w-full flex items-center justify-center">
        <div className="flex items-center gap-3 w-64 opacity-60">
          <div className="h-px bg-border flex-1" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground">Try it</span>
          <div className="h-px bg-border flex-1" />
        </div>
      </div>

      <div className="terminal-card analysis-terminal max-w-md w-[400px] mx-auto shadow-2xl overflow-hidden rounded-[24px] bg-background/95 backdrop-blur-xl border border-border/40 min-h-[460px]">

        {!hasStarted ? (
          /* ─── INITIAL STATE: Preview screen ─── */
          <div className="p-7 h-[460px] flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-bold text-xs tracking-wider uppercase">AI Simulation Preview</span>
              </div>
              <span className="text-muted-foreground text-xs font-medium">Demo</span>
            </div>

            {/* Main Content */}
            <div className="text-center flex-1 flex flex-col items-center justify-center mt-6 relative z-10">
              <div className="flex items-center gap-3 w-full mb-6">
                <div className="h-px bg-border/40 flex-1" />
                <span className="text-[10px] text-muted-foreground tracking-[0.2em] font-semibold uppercase">Featured Fight</span>
                <div className="h-px bg-border/40 flex-1" />
              </div>

              <h3 className="text-[28px] font-black tracking-tight mb-8">
                {f1} vs {f2}
              </h3>

              {/* Status Pill */}
              <div className="flex items-center justify-between w-full p-2.5 px-4 rounded-2xl border border-primary/20 bg-primary/5 mb-2 backdrop-blur-sm shadow-[inset_0_0_20px_hsl(var(--primary)/0.03)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-primary font-bold text-sm tracking-tight">Ready to simulate</span>
                </div>
                <span className="text-muted-foreground/80 text-xs font-mono tracking-widest">{simCount} sims</span>
              </div>
              {/* Decorative line */}
              <div className="w-[120%] h-px bg-linear-to-r from-transparent via-primary/20 to-transparent -ml-[10%]" />
            </div>

            {/* Footer / CTA */}
            <div className="text-center relative z-10 mt-6">
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2.5 bg-linear-to-r from-[#20e3a4] to-[#0ab77f] text-black py-4 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all hover:shadow-[0_0_20px_rgba(32,227,164,0.3)] mb-4"
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="text-base tracking-tight">Run Simulation</span>
              </button>
              <span className="text-[11px] font-medium text-muted-foreground/60 w-full block">See how MAFS identifies betting edges</span>
            </div>

            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-size-[100%_4px] pointer-events-none opacity-20" />
          </div>
        ) : (
          /* ─── ACTIVE STATE: Analysis UI ─── */
          <div className="p-6 min-h-[460px] flex flex-col justify-center animate-in fade-in duration-500">
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
                  <span className={`text-[10px] font-mono tracking-widest ${isAnalyzing ? 'text-amber-400' : 'text-primary'}`}>
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

            {/* Agent Rows */}
            <div className="space-y-1.5 mb-2">
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
                        ? "opacity-0 translate-y-2 pointer-events-none"
                        : isActive
                          ? "bg-primary/10 border-primary/30 scale-[1.02]"
                          : "bg-background/30 border-transparent hover:bg-background/50 opacity-100 translate-y-0"
                    }`}
                    style={{ transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
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

            {/* Consensus */}
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
                onClick={runAnalysis}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-background/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all text-xs text-muted-foreground hover:text-primary animate-in fade-in duration-500 delay-500"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="font-medium">Run Simulation Again</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
