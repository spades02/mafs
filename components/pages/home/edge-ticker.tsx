"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"

interface TickerEdge {
  fighterName: string
  edgePct: number
}

type TickerItem =
  | { type: "edge"; fighter: string; edge: string }
  | { type: "movement"; fighter: string; label: string }
  | { type: "sharp"; fighter: string; label: string }

// Polling interval for fresh edges. Long enough that the marquee isn't
// constantly re-rendering, which interrupts the CSS animation cycle.
const POLL_INTERVAL = 5 * 60_000 // 5 minutes

function EdgeTicker({ tickerEdges }: { tickerEdges?: TickerEdge[] }) {
  const [liveEdges, setLiveEdges] = useState<TickerEdge[]>(tickerEdges || [])
  const lastFingerprintRef = useRef<string>("")

  // Poll for live edges. Skip the state update when the payload hasn't changed,
  // so React doesn't re-render the marquee parent and reset the CSS animation.
  const fetchLiveEdges = useCallback(async () => {
    try {
      const res = await fetch('/api/edges/live', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data.edges?.length > 0) {
        const next: TickerEdge[] = data.edges.map((e: { fighterName: string; edgePct: number }) => ({
          fighterName: e.fighterName,
          edgePct: e.edgePct,
        }))
        const fp = next.map((e) => `${e.fighterName}:${e.edgePct}`).join("|")
        if (fp !== lastFingerprintRef.current) {
          lastFingerprintRef.current = fp
          setLiveEdges(next)
        }
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

  // Memoize so a parent re-render doesn't rebuild the array identity and
  // cause React to re-key the marquee children (which would visually reset it).
  const displayItems = useMemo<TickerItem[]>(() => {
    if (currentEdges.length === 0) return []
    const items: TickerItem[] = currentEdges.slice(0, 10).map((e) => ({
      type: "edge" as const,
      fighter: e.fighterName,
      edge: `+${e.edgePct}%`,
    }))
    let out = [...items]
    while (out.length < 20) {
      out = [...out, ...items]
    }
    return out
  }, [currentEdges])

  if (displayItems.length === 0) return null

  const renderItem = (item: TickerItem, key: number | string) => (
    <div key={key} className="flex shrink-0 items-center gap-3 px-5 py-2.5 rounded-xl bg-background/20 backdrop-blur-sm border border-border/15 hover:border-primary/15 transition-all duration-300">
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
      <div className="flex w-max smooth-ticker whitespace-nowrap">
        <div className="flex gap-4 sm:gap-8 px-2 sm:px-4">
          {displayItems.map((item, idx) => renderItem(item, idx))}
        </div>
        <div className="flex gap-4 sm:gap-8 px-2 sm:px-4" aria-hidden="true">
          {displayItems.map((item, idx) => renderItem(item, `dup-${idx}`))}
        </div>
      </div>
    </section>
  )
}

export default EdgeTicker
