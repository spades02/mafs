"use client"

import Link from "next/link"
import { Play, Eye, LayoutDashboard, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  isPro?: boolean
  isAuthenticated?: boolean
}

const tickerItems = [
  { tag: "EDGE", tagClass: "ticker-tag-edge", fighter: "Alex Pereira", value: "+19%", valueClass: "edge-badge text-[11px] font-bold text-primary" },
  { tag: "EDGE", tagClass: "ticker-tag-edge", fighter: "Petr Yan", value: "+11%", valueClass: "edge-badge text-[11px] font-bold text-primary" },
  { tag: "MOVE", tagClass: "ticker-tag-movement", fighter: "Weili Zhang", value: "Line Movement", valueClass: "text-[11px] text-amber-400" },
  { tag: "EDGE", tagClass: "ticker-tag-edge", fighter: "Ilia Topuria", value: "+19%", valueClass: "edge-badge text-[11px] font-bold text-primary" },
  { tag: "SHARP", tagClass: "ticker-tag-sharp", fighter: "Islam Makhachev", value: "Sharp Action", valueClass: "text-[11px] text-blue-400" },
  { tag: "EDGE", tagClass: "ticker-tag-edge", fighter: "Max Holloway", value: "+14%", valueClass: "edge-badge text-[11px] font-bold text-primary" },
]

function HeroSection({ isPro = false, isAuthenticated = false }: HeroSectionProps) {
  return (
    <section className="relative pt-[72px] sm:pt-[80px] md:pt-[96px] pb-6 px-4">
      {/* Glow behind hero */}
      <div className="absolute top-[60px] sm:top-[70px] md:top-[80px] left-1/2 -translate-x-1/2 w-[700px] h-[450px] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15),transparent_65%)] blur-[70px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Scanner badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-background/60 backdrop-blur-xl border border-primary/20 shadow-[0_0_24px_hsl(var(--primary)/0.12),inset_0_1px_0_rgba(255,255,255,0.05)] mb-6">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.9)]" />
                <div className="absolute h-2 w-2 rounded-full bg-primary animate-ping opacity-75" />
              </div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">AI Edge Scanner Live</span>
            </div>
            <div className="h-4 w-px bg-primary/20" />
            <span className="text-[11px] text-muted-foreground/80 font-mono">
              Scanning 27 sportsbooks <span className="text-primary/40 mx-1">&bull;</span> 847,293 simulations run
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] mb-8 text-balance leading-[1.08]">
            <span className="text-foreground">Find bets when sportsbooks</span>
            <br />
            <span className="text-primary">get the odds wrong.</span>
          </h1>

          {/* Subtitle */}
          <div className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-10 leading-[1.8] md:leading-loose text-center space-y-1">
            {isAuthenticated ? (
              <>
                <p>Your AI edge scanner is ready.</p>
                <p className="text-foreground/80">{isPro ? "Unlimited access to all edges and simulations." : "Upgrade to Pro for unlimited edge detection."}</p>
              </>
            ) : (
              <>
                <p>AI simulates UFC fights thousands of times.</p>
                <p className="text-foreground/80">If the odds are off, MAFS finds the edge.</p>
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-4">
            {isAuthenticated ? (
              <>
                <Button
                  className="premium-button text-[15px] px-7 py-5 h-auto min-h-[52px] font-semibold tracking-[-0.01em] flex items-center gap-2.5"
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
                    <span>Go to Dashboard</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="glass-button text-[15px] px-7 py-5 h-auto min-h-[52px] font-medium tracking-[-0.01em]"
                  asChild
                >
                  <Link href="/dashboard">
                    <BarChart3 className="h-[18px] w-[18px] shrink-0 mr-2.5" />
                    <span>View Your Edges</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="premium-button text-[15px] px-7 py-5 h-auto min-h-[52px] font-semibold tracking-[-0.01em] flex items-center gap-2.5"
                  asChild
                >
                  <Link href="/dashboard">
                    <Play className="h-[18px] w-[18px] shrink-0" />
                    <span>Run Free Fight Simulation</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="glass-button text-[15px] px-7 py-5 h-auto min-h-[52px] font-medium tracking-[-0.01em]"
                  asChild
                >
                  <Link href="#live-edges">
                    <Eye className="h-[18px] w-[18px] shrink-0 mr-2.5" />
                    <span>See Today&apos;s Edges</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground/60 mb-10">No picks. No hype. Just math.</p>

          {/* Sample Edge Terminal Card */}
          <div className="max-w-sm mx-auto">
            <div className="edge-terminal-card p-5 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Sample Edge Detection</span>
                <span className="text-[10px] text-muted-foreground/50 font-mono">Preview Example</span>
              </div>
              <p className="text-lg font-semibold">Alex Pereira</p>
              <p className="text-sm text-muted-foreground mb-4">
                Market Category: <span className="text-foreground/70">Finish Method</span>
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MAFS Probability:</span>
                  <span className="font-mono font-semibold text-primary">61%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Probability:</span>
                  <span className="font-mono">42%</span>
                </div>
                <div className="h-px bg-border/50 my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Edge Detected:</span>
                  <span className="font-mono font-bold text-primary">+19%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling ticker */}
      <div className="mt-10 overflow-hidden">
        <div className="flex smooth-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg ticker-item mx-1.5 shrink-0">
              <span className={`ticker-tag ${item.tagClass}`}>{item.tag}</span>
              <span className="text-sm font-semibold ticker-fighter transition-all duration-300">{item.fighter}</span>
              <span className={`px-2 py-0.5 rounded-md ${item.valueClass}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
