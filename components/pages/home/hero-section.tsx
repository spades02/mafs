"use client"

import Link from "next/link"
import { ArrowRight, LayoutDashboard, BarChart3, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimulationDemo } from "@/components/simulation-demo"
import EdgeTicker from "@/components/pages/home/edge-ticker"
import type { FeaturedFight, LandingEdge } from "@/app/actions/landing-page-actions"

interface HeroSectionProps {
  isPro?: boolean
  isAuthenticated?: boolean
  stats?: {
    simulationsRun: number
    edgesFound: number
  }
  trackRecordSummary?: {
    netProfitStr: string
    winRatePct: number
    roiPct: number
  }
  liveEdgeCount?: number
  featuredFight?: FeaturedFight | null
  topEdges?: LandingEdge[]
}

function HeroSection({
  isPro = false,
  isAuthenticated = false,
  stats,
  trackRecordSummary,
  liveEdgeCount = 0,
  featuredFight,
  topEdges,
}: HeroSectionProps) {
  const simsText = stats?.simulationsRun
    ? `${(Math.floor(stats.simulationsRun / 1000) * 1000).toLocaleString()}+`
    : "847,000+"

  const summary = trackRecordSummary ?? { netProfitStr: "+$24.8K", winRatePct: 83, roiPct: 18 }

  // Build ticker edges from topEdges prop. Require a real DB-resolved fighter
  // pick (pickFighterName) — not a parsed-from-label fallback — so generic
  // bet labels like "Fight" / "Pass" never leak in. Dedupe by fighter so the
  // same name doesn't repeat across the marquee.
  const tickerEdges = (() => {
    const seen = new Set<string>()
    const out: { fighterName: string; edgePct: number }[] = []
    for (const e of topEdges || []) {
      const name = e.pickFighterName
      if (!name || !name.includes(' ')) continue
      if (seen.has(name)) continue
      seen.add(name)
      out.push({ fighterName: name, edgePct: e.edgePct })
    }
    return out
  })()

  const scrollToRecent = () => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('recent-edges')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative pt-16 sm:pt-20 md:pt-24 pb-12 px-6">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,hsl(var(--primary)/0.06),transparent_60%)]" />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Understated badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-6 animate-fade-up">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">The #1 MMA Edge Detection System</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.03em] mb-6 leading-[1.08] animate-fade-up delay-100">
            <span className="text-foreground">Stop gambling.</span>
            <br />
            <span className="bg-linear-to-r from-primary to-[hsl(165,70%,45%)] bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 40px hsl(var(--primary) / 0.25))' }}>Start exploiting edges.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-foreground/70 max-w-[680px] mx-auto mb-8 leading-relaxed text-center animate-fade-up delay-200">
            {isAuthenticated ? (
              <>Your AI edge scanner is ready. {isPro ? "Unlimited access to all edges and simulations." : "Upgrade to Pro for unlimited edge detection."}</>
            ) : (
              <>8 AI agents run <span className="text-foreground font-semibold">{simsText} simulations</span> to find <span className="text-foreground font-semibold">mispriced fights</span> before the market corrects.</>
            )}
          </p>

          {/* Live Edges Bar */}
          <div className="mb-8 -mx-6 animate-fade-up delay-300">
            <EdgeTicker tickerEdges={tickerEdges} />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 animate-fade-up delay-400">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="premium-button text-[15px] px-10 py-6 h-auto min-h-[54px] font-semibold rounded-xl group relative overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-[15px] px-8 py-6 h-auto min-h-[54px] font-medium rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                  <Link href="/dashboard">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>View Your Edges</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="premium-button text-[15px] px-10 py-6 h-auto min-h-[54px] font-semibold rounded-xl group relative overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <span>Get Your Edge</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  onClick={scrollToRecent}
                  variant="outline"
                  size="lg"
                  className="text-[15px] px-8 py-6 h-auto min-h-[54px] font-medium rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 group"
                >
                  <span>See Live Edges</span>
                  {liveEdgeCount > 0 && (
                    <span className="ml-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      {liveEdgeCount} Live
                    </span>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/50 mb-10 animate-fade-in delay-500">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>2,400+ users</span>
            </div>
            <div className="h-3 w-px bg-border/30" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400/70 text-amber-400/70" />
              ))}
              <span className="ml-1">4.9</span>
            </div>
          </div>

          {/* Interactive Simulation Demo */}
          <div className="relative max-w-md mx-auto animate-fade-up delay-600">
            <div className="absolute -inset-6 bg-linear-to-r from-primary/6 via-primary/3 to-primary/6 blur-[50px] rounded-[32px] opacity-50" />
            <div className="relative hover-lift">
              <SimulationDemo featuredFight={featuredFight} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
