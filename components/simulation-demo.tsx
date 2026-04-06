"use client"

import { useState, useEffect } from "react"
import { Zap, Target, Activity, Brain, TrendingUp, Shield, Gauge } from "lucide-react"

const fightAnalysis = {
  fight: "Ilia Topuria vs Islam Makhachev",
  fighter1: { name: "Topuria", initials: "IT" },
  fighter2: { name: "Makhachev", initials: "IM" },
  agents: [
    { name: "Striking", prediction: "Topuria", confidence: 72, icon: Zap },
    { name: "Grappling", prediction: "Makhachev", confidence: 81, icon: Target },
    { name: "Cardio", prediction: "Even", confidence: 50, icon: Activity },
    { name: "Momentum", prediction: "Topuria", confidence: 68, icon: TrendingUp },
    { name: "Fight IQ", prediction: "Makhachev", confidence: 65, icon: Brain },
    { name: "Reach", prediction: "Topuria", confidence: 74, icon: Gauge },
  ],
  consensus: { bet: "Topuria KO/TKO", odds: "+240", agreementPct: 67 }
}

export function SimulationDemo() {
  const [activeAgent, setActiveAgent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % fightAnalysis.agents.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="terminal-card analysis-terminal max-w-sm mx-auto shadow-2xl overflow-hidden rounded-xl bg-background/90 backdrop-blur-md border border-border/50">
      <div className="p-6">
        {/* Fighter Visuals */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
              {fightAnalysis.fighter1.initials}
            </div>
            <span className="text-sm font-semibold">{fightAnalysis.fighter1.name}</span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-muted-foreground/50">VS</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono text-primary tracking-widest">ANALYZING</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-400">
              {fightAnalysis.fighter2.initials}
            </div>
            <span className="text-sm font-semibold">{fightAnalysis.fighter2.name}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          {fightAnalysis.agents.map((agent, idx) => (
            <div 
              key={agent.name}
              className={`agent-row flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
                idx === activeAgent 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-background/30 border-transparent hover:bg-background/50"
              }`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                idx === activeAgent ? "bg-primary/20" : "bg-muted"
              }`}>
                <agent.icon className={`h-4 w-4 ${idx === activeAgent ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground/90">{agent.name}</span>
                  <span className={`text-sm font-bold ${
                    agent.prediction === "Topuria" ? "text-primary" :
                    agent.prediction === "Makhachev" ? "text-blue-400" : "text-muted-foreground"
                  }`}>
                    {agent.prediction}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div 
                      className={`h-full rounded-full animate-fill-bar ${
                        agent.prediction === "Topuria" ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" :
                        agent.prediction === "Makhachev" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-muted-foreground"
                      }`}
                      style={{ width: `${agent.confidence}%`, animationDelay: `${idx * 100}ms` } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-foreground/70">{agent.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consensus - Brighter, More Energy */}
        <div className="mt-5 p-4 rounded-xl bg-primary/15 border border-primary/40 relative z-10 shadow-[0_0_30px_hsl(var(--primary)/0.25),inset_0_1px_0_hsl(var(--primary)/0.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)] rounded-xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">Consensus Pick</span>
              <span className="text-xs text-primary font-bold">{fightAnalysis.consensus.agreementPct}% agreement</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-foreground">{fightAnalysis.consensus.bet}</span>
              <span className="text-2xl font-mono font-black text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.6)' }}>{fightAnalysis.consensus.odds}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
