"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Flame, Timer, ArrowRight, Target, Clock, RefreshCw, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EdgeItem {
  id: string
  fighterName: string
  betType: string
  modelProb: number
  marketProb: number
  edgePct: number
  confidence: string
  eventName?: string
  type?: 'fighter' | 'prop'
  matchupLabel?: string
  pickFighterName?: string | null
  detectedAt?: string
}

interface RecentEdgeFeedProps {
  recentEdges?: EdgeItem[]
  isPro?: boolean
}

const POLL_INTERVAL = 30_000 // 30 seconds

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) setHasStarted(true)
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    const start = Date.now()
    const frame = () => {
      const elapsed = Date.now() - start
      if (elapsed >= duration) {
        setCount(target)
        return
      }
      const progress = elapsed / duration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(target * eased))
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [target, duration, hasStarted])

  return { value: count, ref }
}

function timeAgo(dateString?: string) {
  if (!dateString || dateString.includes('ago') || dateString === 'yesterday') return dateString;
  try {
    const elapsed = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(elapsed / (1000 * 60))
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return "1h ago"
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`
    return `${hours}h ago`
  } catch { return dateString }
}

function EdgeCard({
  edge,
  delay,
  isLive,
  isPremiumLocked,
}: {
  edge: EdgeItem
  delay: number
  isLive: boolean
  isPremiumLocked?: boolean
}) {
  return (
    <div
      className="ultra-card relative overflow-hidden group cursor-pointer hover-spotlight h-full flex flex-col"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`p-6 flex flex-col h-full ${isPremiumLocked ? 'opacity-40 blur-[3px]' : ''}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xl font-bold text-foreground/90 leading-tight">
              {edge.fighterName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {edge.betType}
            </p>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
            edge.confidence === "High" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
          }`}>
            {edge.confidence === "High" ? "STRONG" : "EDGE"}
          </div>
        </div>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/60">MAFS Prob:</span>
            <span className="font-mono text-primary font-bold tabular-nums">
              {edge.modelProb}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/60">Market Prob:</span>
            <span className="font-mono tabular-nums text-foreground/70">{edge.marketProb}%</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/10 mb-5 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded border border-primary/20 bg-primary/20 text-[10px] text-primary font-bold uppercase tracking-widest">
                EDGE
              </span>
              <span className="text-3xl font-mono font-black text-primary tabular-nums tracking-tighter">
                +{edge.edgePct}%
              </span>
            </div>
          </div>

          <div className="space-y-1.5 opacity-60">
             <div className="text-xs text-muted-foreground">
               Detected {isLive ? timeAgo(edge.detectedAt) : timeAgo((edge as { detectedAt?: string }).detectedAt)}
             </div>
             <div className="text-[11px] text-muted-foreground/60">
               Based on simulation + market analysis
             </div>
          </div>
        </div>
      </div>

      {isPremiumLocked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-primary mb-2">Premium Edge Detected</p>
          <div className="text-[11px] text-foreground/80 text-left mb-4 space-y-1">
            <p className="text-muted-foreground mb-1">Members unlock:</p>
            <p>&bull; Exact bet type</p>
            <p>&bull; Sportsbook odds</p>
            <p>&bull; Final MAFS probability</p>
            <p>&bull; Recommended sizing</p>
          </div>
          <Button className="premium-button text-xs px-4 py-2 h-auto" asChild>
            <Link href="/dashboard">Unlock All Live Edges</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function RecentEdgeFeed({ recentEdges, isPro }: RecentEdgeFeedProps) {
  const [liveEdges, setLiveEdges] = useState<EdgeItem[]>(recentEdges || [])
  const [isLive, setIsLive] = useState(!!recentEdges?.length)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchLiveEdges = useCallback(async () => {
    try {
      const res = await fetch('/api/edges/live', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data.edges?.length > 0) {
        setLiveEdges(data.edges)
        setIsLive(true)
        setLastUpdated(new Date())
      }
    } catch {
      // Silently fail — keep showing current data
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    // Fetch immediately on mount if we don't have server-provided edges
    if (!recentEdges?.length) {
      fetchLiveEdges()
    }

    const interval = setInterval(() => {
      fetchLiveEdges()
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchLiveEdges, recentEdges?.length])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchLiveEdges()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const edgesToRender = liveEdges.length > 0 ? liveEdges : recentEdges || []
  const hasEdges = edgesToRender.length > 0
  const edgeCount = useCountUp(edgesToRender.length, 800)

  // If we have no data at all, don't render the section
  if (!hasEdges) return null

  return (
    <section id="recent-edges" className="py-14 md:py-20 px-4 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_55%)]" />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div
            ref={edgeCount.ref}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-linear-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/30 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-60" />
              <Flame className="h-4 w-4 text-amber-500 relative" />
            </div>
            <span className="text-amber-500 text-xs font-black uppercase tracking-wider">
              {edgeCount.value} {isLive ? 'live edges' : 'edges'} detected right now
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 text-balance tracking-tight">
            Sportsbooks get <span className="text-primary">odds wrong</span>
          </h2>
          <p className="text-base text-foreground/70 text-pretty mb-2">
            {isLive
              ? "Real-time edge detection from MAFS AI — refreshed every 30 seconds."
              : "Find bets when they do — before the market corrects."
            }
          </p>
          <p className="text-sm text-amber-500 font-bold flex items-center justify-center gap-2">
            <Timer className="h-4 w-4" />
            Edges close fast. Most last 2–6 hours.
          </p>
        </div>

        {/* Live indicator bar */}
        {isLive && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Live Feed</span>
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground/50">
                Updated {timeAgo(lastUpdated.toISOString())}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
              title="Refresh edges"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8 stagger-fade-in items-stretch max-w-4xl mx-auto">
          {edgesToRender.slice(0, 2).map((edge, idx) => (
            <EdgeCard 
              key={edge.id || idx} 
              edge={edge} 
              delay={idx * 0.08} 
              isLive={isLive}
              isPremiumLocked={idx >= 1 && !isPro} // E.g., lock the 2nd edge for free users as a preview/tease
            />
          ))}
        </div>

        {isLive ? (
          <p className="text-center text-xs text-muted-foreground/50 mb-8">
            Real edges detected by MAFS AI across upcoming UFC events.
            <br />
            <span className="text-primary/40">Auto-refreshes every 30s</span>
          </p>
        ) : (
          <p className="text-center text-xs text-muted-foreground/50 mb-8">
            These examples reflect how MAFS identifies pricing inefficiencies
            across markets.
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="premium-button">
            <Link href="/dashboard">
              {isLive ? "View Full Edge Dashboard" : "View AI Edge Analysis"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard">Run Free Simulation</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default RecentEdgeFeed
