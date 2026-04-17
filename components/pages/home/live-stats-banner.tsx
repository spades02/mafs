"use client"

import { useRef } from "react"
import { useCountUpOnView } from "@/lib/hooks/use-count-up"

interface LiveStatsBannerProps {
  stats?: {
    simulationsRun: number
    edgesFound: number
  }
  trackRecordSummary?: {
    winRatePct: number
    roiPct: number
  }
}

function LiveStatsBanner({ stats, trackRecordSummary }: LiveStatsBannerProps) {
  const simRef = useRef<HTMLDivElement>(null)
  const edgesRef = useRef<HTMLDivElement>(null)
  const roiRef = useRef<HTMLDivElement>(null)
  const accRef = useRef<HTMLDivElement>(null)

  const simulations = useCountUpOnView(simRef, stats?.simulationsRun ?? 847293, 2500)
  const edgesFound = useCountUpOnView(edgesRef, stats?.edgesFound ?? 12847, 2200)
  const roi = useCountUpOnView(roiRef, trackRecordSummary?.roiPct ?? 18, 1800, { suffix: "%", prefix: "+" })
  const accuracy = useCountUpOnView(accRef, trackRecordSummary?.winRatePct ?? 71, 2000, { suffix: "%" })

  return (
    <section className="relative border-y border-primary/20 overflow-hidden bg-linear-to-r from-primary/3 via-primary/8 to-primary/3">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4">
          <div ref={simRef} className="py-10 md:py-14 text-center border-r border-primary/15 last:border-r-0 group cursor-default">
            <p className="text-3xl md:text-5xl font-black tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105 text-primary" style={{ textShadow: '0 0 50px hsl(var(--primary) / 0.5)' }}>{simulations}</p>
            <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Simulations Run</p>
          </div>
          <div ref={edgesRef} className="py-10 md:py-14 text-center border-r border-primary/15 last:border-r-0 group cursor-default">
            <p className="text-3xl md:text-5xl font-black text-foreground tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105">{edgesFound}</p>
            <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Edges Exposed</p>
          </div>
          <div ref={roiRef} className="py-10 md:py-14 text-center border-r border-primary/15 last:border-r-0 group cursor-default">
            <p className="text-3xl md:text-5xl font-black tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105 text-primary" style={{ textShadow: '0 0 50px hsl(var(--primary) / 0.5)' }}>{roi}</p>
            <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Avg ROI</p>
          </div>
          <div ref={accRef} className="py-10 md:py-14 text-center group cursor-default">
            <p className="text-3xl md:text-5xl font-black text-foreground tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105">{accuracy}</p>
            <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Hit Rate</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LiveStatsBanner
