"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Flame, Timer, ArrowRight, Target, Activity, Zap, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RecentEdgeFeedProps {
  recentEdges?: {
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
  }[]
}

const mockRecentEdges = [
  {
    id: "m1",
    fighterName: "Alex Pereira",
    betType: "Finish Method",
    modelProb: 61,
    marketProb: 42,
    edgePct: 19,
    confidence: "High",
    detectedAt: "2h ago",
  },
  {
    id: "m2",
    fighterName: "Ilia Topuria",
    betType: "Victory Method",
    modelProb: 58,
    marketProb: 45,
    edgePct: 13,
    confidence: "High",
    detectedAt: "4h ago",
  },
  {
    id: "m3",
    fighterName: "Petr Yan",
    betType: "Fight Outcome",
    modelProb: 55,
    marketProb: 47,
    edgePct: 8,
    confidence: "Medium",
    detectedAt: "5h ago",
  },
  {
    id: "m4",
    fighterName: "Max Holloway",
    betType: "Total Rounds",
    modelProb: 52,
    marketProb: 41,
    edgePct: 11,
    confidence: "Medium",
    detectedAt: "6h ago",
  },
  {
    id: "m5",
    fighterName: "Sean O'Malley",
    betType: "Decision Path",
    modelProb: 49,
    marketProb: 38,
    edgePct: 11,
    confidence: "Medium",
    detectedAt: "yesterday",
  },
]

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
    const hours = Math.floor(elapsed / (1000 * 60 * 60))
    if (hours < 1) return "Just now"
    if (hours === 1) return "1h ago"
    if (hours > 24) return "yesterday"
    return `${hours}h ago`
  } catch (e) { return dateString }
}



function EdgeCard({
  edge,
  delay,
}: {
  edge: NonNullable<RecentEdgeFeedProps["recentEdges"]>[number]
  delay: number
}) {
  const isProp = edge.type === 'prop' || edge.fighterName === 'Fight Prop' || edge.fighterName === 'Fight GTD'
  const Icon = isProp ? (edge.fighterName.includes('GTD') || edge.fighterName.includes('Starts') ? Clock : Target) : null;
  
  return (
    <div
      className="ultra-card p-5 group cursor-pointer hover-spotlight h-full flex flex-col"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon ? (
           <div className="h-10 w-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
             <Icon className="h-5 w-5 text-primary" />
           </div>
        ) : (
           <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_top_left,rgba(100,255,218,0.2),transparent)] border border-primary/20 flex items-center justify-center text-xs font-bold text-primary/80 shrink-0">
             {edge.fighterName.slice(0, 2).toUpperCase()}
           </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground/90 truncate leading-tight">
            {edge.fighterName}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5 truncate">
            {edge.betType}
          </p>
          {edge.matchupLabel && edge.matchupLabel !== edge.fighterName && (
            <p className="text-[9px] text-muted-foreground/60 truncate mt-0.5">
              {edge.matchupLabel}
            </p>
          )}
        </div>
        <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shrink-0 ${
          edge.confidence === "High" ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-muted-foreground/10"
        }`}>
          {edge.confidence}
        </div>
      </div>

      <div className="space-y-1.5 text-[11px] mb-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground/60">MAFS Win Prob</span>
          <span className="font-mono text-primary font-bold tabular-nums">
            {edge.modelProb}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground/60">Market Odds Prob</span>
          <span className="font-mono tabular-nums text-foreground/70">{edge.marketProb}%</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="p-3 rounded-xl bg-linear-to-br from-primary/10 to-primary/[0.02] border border-primary/20 mb-3 group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-primary/50 font-black uppercase tracking-widest">
              Edge
            </span>
            <span className="text-xl font-mono font-black text-primary tabular-nums">
              +{edge.edgePct}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 opacity-50">
           <span className="text-[9px] uppercase tracking-tighter">Detected</span>
           <span className="text-[9px] font-mono">{timeAgo((edge as { detectedAt?: string }).detectedAt)}</span>
        </div>
      </div>
    </div>
  )
}

function RecentEdgeFeed({ recentEdges }: RecentEdgeFeedProps) {
  const edgesToRender = recentEdges?.length ? recentEdges : mockRecentEdges;
  const edgeCount = useCountUp(edgesToRender.length, 800)

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
              {edgeCount.value} edges detected right now
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 text-balance tracking-tight">
            Sportsbooks get <span className="text-primary">odds wrong</span>
          </h2>
          <p className="text-base text-foreground/70 text-pretty mb-2">
            Find bets when they do — before the market corrects.
          </p>
          <p className="text-sm text-amber-500 font-bold flex items-center justify-center gap-2">
            <Timer className="h-4 w-4" />
            Edges close fast. Most last 2–6 hours.
          </p>
        </div>

        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 stagger-fade-in items-stretch">
          {edgesToRender.map((edge, idx) => (
            <EdgeCard key={edge.id || idx} edge={edge} delay={idx * 0.08} />
          ))}
        </div>

        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar">
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {edgesToRender.map((edge, idx) => (
              <div key={edge.id || idx} className="w-[280px] shrink-0 snap-start items-stretch flex">
                <EdgeCard edge={edge} delay={0} />
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mb-8">
          These examples reflect how MAFS identifies pricing inefficiencies
          across markets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="premium-button">
            <Link href="/dashboard">
              View AI Edge Analysis
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
