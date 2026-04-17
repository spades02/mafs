"use client"

import { useEffect, useState, useCallback } from "react"

interface TickerEdge {
  fighterName: string
  edgePct: number
}

type TickerItem =
  | { type: "edge"; fighter: string; edge: string }
  | { type: "movement"; fighter: string; label: string }
  | { type: "sharp"; fighter: string; label: string }

const POLL_INTERVAL = 30_000 // 30 seconds

function EdgeTicker({ tickerEdges }: { tickerEdges?: TickerEdge[] }) {
  const [pulse, setPulse] = useState(false)
  const [liveEdges, setLiveEdges] = useState<TickerEdge[]>(tickerEdges || [])

  // Pulse animation every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 1000)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Poll for live edges
  const fetchLiveEdges = useCallback(async () => {
    try {
      const res = await fetch('/api/edges/live', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data.edges?.length > 0) {
        setLiveEdges(data.edges.map((e: { fighterName: string; edgePct: number }) => ({
          fighterName: e.fighterName,
          edgePct: e.edgePct,
        })))
      }
    } catch {
      // Silently fail — keep showing current data
    }
  }, [])

  useEffect(() => {
    if (!tickerEdges?.length) {
      fetchLiveEdges()
    }
    const interval = setInterval(fetchLiveEdges, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchLiveEdges, tickerEdges?.length])

  const currentEdges = liveEdges.length > 0 ? liveEdges : tickerEdges || []

  const items: TickerItem[] = currentEdges.length > 0
    ? currentEdges.slice(0, 10).map(e => ({
        type: "edge" as const,
        fighter: e.fighterName,
        edge: `+${e.edgePct}%`,
      }))
    : [] // Don't show anything if no live data

  // If there's no data at all, hide the ticker
  if (items.length === 0) return null

  // Ensure we have enough items to fill a wide screen for the marquee effect
  let displayItems = [...items]
  while (displayItems.length < 15) {
    displayItems = [...displayItems, ...items]
  }

  const renderItem = (item: TickerItem, idx: number) => (
    <div key={idx} className="flex shrink-0 items-center gap-3 px-5 py-2.5 rounded-xl bg-background/20 backdrop-blur-sm border border-border/15 hover:border-primary/15 transition-all duration-300">
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
  )

  return (
    <section className="relative py-4 overflow-hidden border-y border-primary/10 bg-linear-to-r from-background via-primary/3 to-background">
      <div className={`flex w-max smooth-ticker whitespace-nowrap ${pulse ? 'ticker-pulse' : ''}`}>
        <div className="flex gap-4 sm:gap-8 px-2 sm:px-4">
          {displayItems.map((item, idx) => renderItem(item, idx))}
        </div>
        <div className="flex gap-4 sm:gap-8 px-2 sm:px-4" aria-hidden="true">
          {displayItems.map((item, idx) => renderItem(item, idx))}
        </div>
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
