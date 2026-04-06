"use client"

import { useEffect, useState } from "react"

interface TickerEdge {
  fighterName: string
  edgePct: number
}

const fallbackTickerItems = [
  { type: "edge" as const, fighter: "Alex Pereira", edge: "+19%" },
  { type: "edge" as const, fighter: "Petr Yan", edge: "+11%" },
  { type: "movement" as const, fighter: "Weili Zhang", label: "Line Movement" },
  { type: "edge" as const, fighter: "Ilia Topuria", edge: "+19%" },
  { type: "sharp" as const, fighter: "Islam Makhachev", label: "Sharp Action" },
  { type: "edge" as const, fighter: "Max Holloway", edge: "+14%" },
]

type TickerItem =
  | { type: "edge"; fighter: string; edge: string }
  | { type: "movement"; fighter: string; label: string }
  | { type: "sharp"; fighter: string; label: string }

function EdgeTicker({ tickerEdges }: { tickerEdges?: TickerEdge[] }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 1000)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const items: TickerItem[] = tickerEdges?.length
    ? tickerEdges.slice(0, 6).map(e => ({
        type: "edge" as const,
        fighter: e.fighterName,
        edge: `+${e.edgePct}%`,
      }))
    : fallbackTickerItems

  return (
    <section className="relative py-4 overflow-hidden border-y border-primary/10 bg-gradient-to-r from-background via-primary/[0.03] to-background">
      <div className={`flex items-center gap-8 smooth-ticker whitespace-nowrap ${pulse ? 'ticker-pulse' : ''}`}>
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-background/20 backdrop-blur-sm border border-border/15 hover:border-primary/15 transition-all duration-300">
            {item.type === "edge" && (
              <>
                <span className="ticker-tag ticker-tag-edge">EDGE</span>
                <span className="text-sm font-medium text-foreground/90">{item.fighter}</span>
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
                  {item.edge}
                </span>
              </>
            )}
            {item.type === "movement" && (
              <>
                <span className="ticker-tag ticker-tag-movement">MOVE</span>
                <span className="text-sm font-medium text-foreground/90">{item.fighter}</span>
                <span className="text-[11px] text-amber-400/80">{item.label}</span>
              </>
            )}
            {item.type === "sharp" && (
              <>
                <span className="ticker-tag ticker-tag-sharp">SHARP</span>
                <span className="text-sm font-medium text-foreground/90">{item.fighter}</span>
                <span className="text-[11px] text-blue-400/80">{item.label}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .ticker-pulse { animation: tickerPulse 1s ease-out; }
        @keyframes tickerPulse {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
          100% { filter: brightness(1); }
        }
      `}</style>
    </section>
  )
}

export default EdgeTicker
