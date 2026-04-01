"use client"

import { Swords, Shield, Heart, Zap, Brain, Ruler, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const agents = [
  { name: "Striking", icon: Swords, favors: "Topuria", favorColor: "text-primary", percentage: 72, barColor: "bg-primary", bgClass: "bg-primary/10 border-primary/30", active: true },
  { name: "Grappling", icon: Shield, favors: "Makhachev", favorColor: "text-blue-400", percentage: 81, barColor: "bg-blue-500", bgClass: "bg-background/30 border-transparent", active: false },
  { name: "Cardio", icon: Heart, favors: "Even", favorColor: "text-muted-foreground", percentage: 50, barColor: "bg-muted-foreground", bgClass: "bg-background/30 border-transparent", active: false },
  { name: "Momentum", icon: Zap, favors: "Topuria", favorColor: "text-primary", percentage: 68, barColor: "bg-primary", bgClass: "bg-background/30 border-transparent", active: false },
  { name: "Fight IQ", icon: Brain, favors: "Makhachev", favorColor: "text-blue-400", percentage: 65, barColor: "bg-blue-500", bgClass: "bg-background/30 border-transparent", active: false },
  { name: "Reach", icon: Ruler, favors: "Topuria", favorColor: "text-primary", percentage: 74, barColor: "bg-primary", bgClass: "bg-background/30 border-transparent", active: false },
]

const lineMovement = [
  { time: "3h ago", line: "-120", current: false },
  { time: "2h ago", line: "-130", current: false },
  { time: "1h ago", line: "-140", current: false },
  { time: "Now", line: "-145", current: true },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">How It Works</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            How the AI Breaks Down a Fight
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Each agent analyzes fights from a specialized angle. When multiple agents agree, you&apos;ve found real value.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Agent Analysis Card */}
          <Card className="terminal-card analysis-terminal">
            <CardContent className="p-6">
              {/* Fighter matchup header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">IT</div>
                  <span className="text-sm font-semibold">Topuria</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold text-muted-foreground/50">VS</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-mono text-primary">ANALYZING</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-400">IM</div>
                  <span className="text-sm font-semibold">Makhachev</span>
                </div>
              </div>

              {/* Agent rows */}
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div
                    key={agent.name}
                    className={`agent-row flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 ${agent.bgClass} hover:bg-background/50`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${agent.active ? 'bg-primary/20' : 'bg-muted'}`}>
                      <agent.icon className={`h-5 w-5 ${agent.active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{agent.name} Agent</span>
                        <span className={`text-sm font-semibold ${agent.favorColor}`}>→ {agent.favors}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${agent.barColor}`}
                            style={{ width: `${agent.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{agent.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consensus Pick */}
              <div className="mt-6 p-4 rounded-xl consensus-box relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-[0.15em]">Consensus Pick</span>
                  <span className="text-xs text-primary/70 font-medium">67% agreement</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">Topuria KO/TKO</span>
                  <span className="text-2xl font-mono font-bold text-primary glow-text">+240</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sharp Money Intelligence */}
          <Card className="terminal-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Sharp Money Intelligence</h3>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">Sharp Money Detected</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">Yan ML</span>
                  <span className="text-xl font-mono">-145</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: "74%" }} />
                  </div>
                  <span className="text-sm font-bold text-blue-400">74%</span>
                </div>
                <p className="text-sm text-muted-foreground">of sharp bettors backing this line</p>
              </div>

              {/* Line Movement */}
              <div>
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Line Movement
                </h4>
                <div className="flex items-center justify-between">
                  {lineMovement.map((entry, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-lg font-mono font-bold ${entry.current ? 'text-primary' : 'text-muted-foreground'}`}>
                        {entry.line}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{entry.time}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-muted/30 rounded-md p-3">
                  <div className="line-movement-bar" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
