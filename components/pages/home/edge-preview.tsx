import Link from "next/link"
import { Lock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EdgePreviewProps {
  isPro?: boolean
  previewEdges?: {
    fighterName: string
    betType: string
    modelProb: number
    marketProb: number
    edgePct: number
    confidence: string
    type?: 'fighter' | 'prop'
    matchupLabel?: string
  }[]
}

const fallbackEdges = [
  { fighter: "Alex Pereira", category: "Finish Method", confidence: "High", confidenceClass: "bg-primary/20 text-primary", mafsProb: 61, marketProb: 42, edge: 19, edgeLabel: null, locked: false, type: 'fighter' as const, matchupLabel: undefined as string | undefined },
  { fighter: "Petr Yan", category: "Fight Outcome", confidence: "Medium", confidenceClass: "bg-amber-500/20 text-amber-400", mafsProb: 58, marketProb: 47, edge: null, edgeLabel: "Strong Value", locked: false, type: 'fighter' as const, matchupLabel: undefined as string | undefined },
  { fighter: "Ilia Topuria", category: "Victory Method", confidence: "High", confidenceClass: "bg-primary/20 text-primary", mafsProb: 48, marketProb: 29, edge: 19, edgeLabel: null, locked: true, type: 'fighter' as const },
]

function EdgePreview({ isPro = false, previewEdges }: EdgePreviewProps) {
  const dynamicEdges = previewEdges?.length ? previewEdges.slice(0, 3).map((e, index) => ({
    fighter: e.fighterName,
    category: e.betType,
    matchupLabel: e.matchupLabel,
    confidence: e.confidence === "High" ? "High" : "Medium",
    confidenceClass: e.confidence === "High" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400",
    mafsProb: e.modelProb,
    marketProb: e.marketProb,
    edge: index === 2 && !isPro ? null : e.edgePct, 
    edgeLabel: index === 2 && !isPro ? "Strong Value" : null,
    locked: index === 2 && !isPro,
    type: e.type
  })) : fallbackEdges;
  return (
    <section id="live-edges" className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview Example</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">Edge Detection Preview</h2>
          <p className="text-lg text-muted-foreground text-pretty">Sample of AI-detected betting edges.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {dynamicEdges.map((edge, i) => {
            const isLocked = edge.locked && !isPro
            return isLocked ? (
              <Card key={i} className="terminal-card relative overflow-hidden">
                <CardContent className="p-6 opacity-40 blur-[2px]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold">{edge.fighter}</p>
                      <p className="text-sm text-muted-foreground mt-1">Market Category: {edge.category}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${edge.confidenceClass}`}>
                      {edge.confidence}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MAFS Probability</span>
                      <span className="font-mono text-primary">{edge.mafsProb}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Market Probability</span>
                      <span className="font-mono">{edge.marketProb}%</span>
                    </div>
                  </div>
                </CardContent>
                {/* Lock overlay */}
                <div className="absolute inset-0 bg-background/70 backdrop-blur-[4px] flex flex-col items-center justify-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-primary text-center mb-2">Premium Edge Detected</p>
                  <div className="text-[11px] text-muted-foreground text-left mb-4 space-y-0.5">
                    <p>Members unlock:</p>
                    <p>&bull; Exact bet type</p>
                    <p>&bull; Sportsbook odds</p>
                    <p>&bull; Expected value</p>
                    <p>&bull; Bet sizing</p>
                    <p>&bull; Full model breakdown</p>
                  </div>
                  <Button className="premium-button text-sm px-4 py-2 h-auto" asChild>
                    <Link href="/dashboard">Unlock All Edges</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card key={i} className="terminal-card group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                       {edge.type === 'prop' ? <Target className="h-6 w-6 text-primary" /> : <span className="text-sm font-bold text-primary">{edge.fighter.slice(0,2).toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold truncate">{edge.fighter}</p>
                      {edge.matchupLabel && edge.matchupLabel !== edge.fighter && (
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider truncate">{edge.matchupLabel}</p>
                      )}
                      <p className="text-sm text-muted-foreground truncate">{edge.category}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold shrink-0 ${edge.confidenceClass}`}>
                      {edge.confidence}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MAFS Probability</span>
                      <span className="font-mono text-primary font-semibold">{edge.mafsProb}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Market Probability</span>
                      <span className="font-mono">{edge.marketProb}%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg edge-badge">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-primary/70 font-semibold uppercase tracking-wider">Edge Detected</span>
                      <span className="text-lg font-bold text-primary">
                        {edge.edge ? `+${edge.edge}%` : edge.edgeLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/50 mt-4">
                    <span>Sample Detection</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto leading-relaxed mb-6">
            {isPro ? (
              <>All edges unlocked with your Pro membership.<br />Head to your dashboard for live, real-time edge detection.</>
            ) : (
              <>MAFS scans thousands of betting markets.<br />Members see the exact bets, odds, and EV when sportsbooks misprice a line.</>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}

export default EdgePreview
