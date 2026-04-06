import Link from "next/link"
import { Lock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MarketEdgeRadarProps {
  isPro?: boolean
  radarEdges?: {
    fighterName: string
    betType: string
    edgePct: number
    confidence: string
    type: 'fighter' | 'prop'
  }[]
}

const fallbackEdgeCards = [
  { fighter: "Alex Pereira", category: "Finish Method", confidence: "High", confidenceClass: "bg-primary/20 text-primary", edge: "+19%", locked: false, type: 'fighter' as const },
  { fighter: "Ilia Topuria", category: "Victory Method", confidence: null, confidenceClass: "", edge: "Strong Value", locked: false, type: 'fighter' as const },
  { fighter: "Petr Yan", category: "Fight Outcome", confidence: null, confidenceClass: "", edge: "High Edge", locked: false, type: 'fighter' as const },
  { fighter: "Khamzat Chimaev", category: "Victory Method", confidence: null, confidenceClass: "", edge: "Strong Value", locked: true, type: 'prop' as const },
]

function MarketEdgeRadar({ isPro = false, radarEdges }: MarketEdgeRadarProps) {
  const dynamicEdgeCards = radarEdges?.length ? radarEdges.slice(0, 4).map((e, index) => ({
    fighter: e.fighterName,
    category: e.betType,
    confidence: e.confidence === "High" ? "High" : null,
    confidenceClass: e.confidence === "High" ? "bg-primary/20 text-primary" : "",
    edge: index === 0 ? `+${e.edgePct}%` : e.edgePct > 10 ? "Strong Value" : "High Edge",
    locked: index === 3 && !isPro,
    type: e.type
  })) : fallbackEdgeCards;
  return (
    <section className="py-20 md:py-28 px-4 relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,hsl(var(--primary)/0.08),transparent_70%)]" />
      </div>

      <div className="container mx-auto max-w-5xl relative">
        {/* Urgency badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-sm font-semibold text-amber-400">27+ sportsbooks scanned every minute</span>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">Most edges disappear within minutes.</p>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sample Edge Detection</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">Market Edge Radar</h2>
          <p className="text-lg text-muted-foreground text-pretty">AI scanning for mispriced odds. Preview of edge detection capabilities.</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {dynamicEdgeCards.map((card, i) => {
            const isLocked = card.locked && !isPro
            return (
            <div key={i} className="relative">
              {isLocked ? (
                <div className="relative p-4 rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                  {/* Blurred background content */}
                  <div className="opacity-30">
                    <p className="text-sm font-semibold mb-1">{card.fighter}</p>
                    <p className="text-[11px] text-muted-foreground mb-3">Market Category: {card.category}</p>
                    <p className="text-sm font-bold text-primary">{card.edge}</p>
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 backdrop-blur-[6px] bg-background/60 z-10 flex flex-col items-center justify-center p-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-primary text-center mb-2">Premium Edge Detected</p>
                    <div className="text-[10px] text-muted-foreground text-left mb-3 space-y-0.5">
                      <p>Members unlock:</p>
                      <p>&bull; Exact bet type</p>
                      <p>&bull; Sportsbook odds</p>
                      <p>&bull; Expected value</p>
                      <p>&bull; Bet sizing</p>
                    </div>
                    <Button size="sm" className="premium-button text-xs px-3 py-1.5 h-auto" asChild>
                      <Link href="/dashboard">Unlock All Edges</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="terminal-card h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                         {card.type === 'prop' ? <Target className="h-4 w-4 text-primary" /> : <span className="text-[10px] font-bold text-primary">{card.fighter.slice(0,2).toUpperCase()}</span>}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate leading-tight">{card.fighter}</p>
                         <p className="text-[10px] text-muted-foreground truncate">{card.category}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                       <span className="text-[10px] font-bold text-primary">{card.edge}</span>
                       <span className={`text-[8px] font-black px-1 rounded ${card.confidenceClass || 'bg-muted text-muted-foreground'}`}>{card.confidence || 'MED'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )})}
        </div>

        {/* Bottom CTA text */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto leading-relaxed mb-6">
            {isPro ? (
              <>MAFS scans thousands of betting markets in real-time.<br />All edges unlocked with your Pro membership.</>
            ) : (
              <>MAFS scans thousands of betting markets.<br />Members see the exact bets, odds, and EV when sportsbooks misprice a line.</>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}

export default MarketEdgeRadar
