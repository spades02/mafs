"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadarParticles } from "@/components/radar-particles"
import { SimulationDemo } from "@/components/simulation-demo"
import { 
  Activity, TrendingUp, Target, Zap, ChevronDown, Search, CheckCircle2, 
  ArrowRight, BarChart3, Shield, Clock, Star, Users, LineChart, Brain, 
  Cpu, Network, ChevronRight, Play, Sparkles, Eye, Lock, Gauge,
  ArrowUpRight, Check, X, CircleDot, DollarSign, Trophy, AlertTriangle,
  Timer, Flame, TrendingDown, Info
} from "lucide-react"

// Trust metrics animation hook
function useCountUp(target: number, duration: number = 2000, suffix: string = "", prefix: string = "") {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const startTime = Date.now()
    const frame = () => {
      const elapsed = Date.now() - startTime
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

  return { value: prefix + count.toLocaleString() + suffix, ref }
}

// Edge ticker items - radar feed style (no exact bets, no timestamps)
const tickerEdges = [
  { type: "edge", fighter: "Alex Pereira", edge: "+19%" },
  { type: "edge", fighter: "Petr Yan", edge: "+11%" },
  { type: "movement", fighter: "Weili Zhang", label: "Line Movement" },
  { type: "edge", fighter: "Ilia Topuria", edge: "+19%" },
  { type: "sharp", fighter: "Islam Makhachev", label: "Sharp Action" },
  { type: "edge", fighter: "Max Holloway", edge: "+14%" },
]

// Calculate EV helper
function calculateEV(modelProb: number, odds: string): number {
  const decimal = odds.startsWith("+") 
    ? (parseInt(odds) / 100) + 1 
    : (100 / Math.abs(parseInt(odds))) + 1
  return (modelProb / 100) * decimal - 1
}

// Recent AI-Detected Edges Feed - believable sample data with timestamps
const recentEdgeFeed = [
  {
    fighter: "Alex Pereira",
    marketType: "Finish Method",
    mafsProb: 61,
    marketProb: 42,
    edge: 19,
    confidence: "High",
    detected: "2h ago"
  },
  {
    fighter: "Ilia Topuria",
    marketType: "Victory Method",
    mafsProb: 58,
    marketProb: 45,
    edge: 13,
    confidence: "High",
    detected: "4h ago"
  },
  {
    fighter: "Petr Yan",
    marketType: "Fight Outcome",
    mafsProb: 55,
    marketProb: 47,
    edge: 8,
    confidence: "Medium",
    detected: "5h ago"
  },
  {
    fighter: "Max Holloway",
    marketType: "Total Rounds",
    mafsProb: 52,
    marketProb: 41,
    edge: 11,
    confidence: "Medium",
    detected: "6h ago"
  },
  {
    fighter: "Sean O'Malley",
    marketType: "Decision Path",
    mafsProb: 49,
    marketProb: 38,
    edge: 11,
    confidence: "Medium",
    detected: "yesterday"
  },
]

// Live edge feed data - Sample preview (no timestamps, no exact bets)
const liveEdges = [
  {
    fighter: "Alex Pereira",
    marketCategory: "Finish Method",
    modelProb: 61,
    marketProb: 42,
    edge: 19,
    confidence: "High"
  },
  {
    fighter: "Petr Yan",
    marketCategory: "Fight Outcome",
    modelProb: 58,
    marketProb: 47,
    edge: 11,
    confidence: "Medium"
  },
  {
    fighter: "Ilia Topuria",
    marketCategory: "Victory Method",
    modelProb: 48,
    marketProb: 29,
    edge: 19,
    confidence: "High"
  },
]

// Agent predictions for fight analysis
const fightAnalysis = {
  fight: "Ilia Topuria vs Islam Makhachev",
  fighter1: { name: "Topuria", initials: "IT" },
  fighter2: { name: "Makhachev", initials: "IM" },
  agents: [
    { name: "Striking", prediction: "Topuria", confidence: 72, icon: Zap },
    { name: "Grappling", prediction: "Makhachev", confidence: 81, icon: Target },
    { name: "Cardio", prediction: "Even", confidence: 50, icon: Activity },
    { name: "Momentum", prediction: "Topuria", confidence: 68, icon: TrendingUp },
    { name: "Fight IQ", prediction: "Makhachev", confidence: 65, icon: Brain },
    { name: "Reach", prediction: "Topuria", confidence: 74, icon: Gauge },
  ],
  consensus: { bet: "Topuria KO/TKO", odds: "+240", agreementPct: 67 }
}

// Sharp money data
const sharpMoney = {
  fighter: "Yan ML",
  odds: "-145",
  sharpPct: 74,
  lineHistory: [
    { time: "3h ago", odds: "-120" },
    { time: "2h ago", odds: "-130" },
    { time: "1h ago", odds: "-140" },
    { time: "Now", odds: "-145" },
  ]
}

// Past results
const pastResults = [
  { bet: "Topuria KO", odds: "+210", result: "WIN", profit: "+$210" },
  { bet: "Pereira ML", odds: "-120", result: "WIN", profit: "+$83" },
  { bet: "Yan Over 2.5", odds: "+105", result: "WIN", profit: "+$105" },
  { bet: "Sterling ML", odds: "-180", result: "WIN", profit: "+$56" },
  { bet: "Holloway Dec", odds: "+140", result: "LOSS", profit: "-$100" },
  { bet: "Tsarukyan ML", odds: "-110", result: "WIN", profit: "+$91" },
]

// Testimonials - specific results with dollar amounts
const testimonials = [
  {
    name: "Marcus T.",
    role: "Full-time Bettor",
    quote: "I was skeptical of another 'edge finder' but MAFS is different. The AI actually finds real mispriced lines. Made back my yearly sub in 3 days.",
    avatar: "MT",
    result: "+$31,400/year"
  },
  {
    name: "Jake R.",
    role: "Data Scientist",
    quote: "As someone who builds models for a living, I'm genuinely impressed. The multi-agent consensus approach catches things my own models miss.",
    avatar: "JR",
    result: "76% hit rate"
  },
  {
    name: "David K.",
    role: "Former Losing Bettor",
    quote: "I lost $8K last year betting on gut feelings. This year I'm up $12K using MAFS. Night and day difference.",
    avatar: "DK",
    result: "+22% ROI"
  }
]

// Pricing features
const pricingFeatures = [
  { feature: "Fight Simulation Engine", free: true, pro: true },
  { feature: "Edge Detection System", free: "3/day", pro: "Unlimited" },
  { feature: "Sharp Money Tracker", free: false, pro: true },
  { feature: "CLV Edge Tracking", free: false, pro: true },
  { feature: "Market Line Scanner", free: "5 books", pro: "27+ books" },
  { feature: "Risk-Adjusted Picks", free: false, pro: true },
  { feature: "Priority Support", free: false, pro: true },
]

// Why Most Bettors Lose - contrasting comparison
const losingBettorReasons = [
  "Betting narratives",
  "Twitter picks",
  "Gut feeling decisions",
  "No mathematical edge"
]

const mafsAdvantage = [
  "Multi-agent fight simulation",
  "Statistical probability modeling",
  "Pricing gap detection",
  "Only bet when the math favors you"
]

export default function LandingPage() {
  const [activeAgent, setActiveAgent] = useState(0)
  const [newEdgePulse, setNewEdgePulse] = useState(false)

  // Animated counters
  const simulations = useCountUp(847293, 2500)
  const edgesFound = useCountUp(12847, 2200)
  const avgROI = useCountUp(18, 1800, "%", "+")
  const accuracy = useCountUp(71, 2000, "%")

  // Agent rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % 6)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Pulse effect for new edges
  useEffect(() => {
    const interval = setInterval(() => {
      setNewEdgePulse(true)
      setTimeout(() => setNewEdgePulse(false), 1000)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const agents = [
    { name: "Striking", icon: Zap, color: "text-amber-400" },
    { name: "Grappling", icon: Target, color: "text-blue-400" },
    { name: "Cardio", icon: Activity, color: "text-green-400" },
    { name: "Fight IQ", icon: Brain, color: "text-purple-400" },
    { name: "Momentum", icon: TrendingUp, color: "text-rose-400" },
    { name: "Clinch", icon: Shield, color: "text-cyan-400" },
    { name: "Reach", icon: Gauge, color: "text-orange-400" },
    { name: "Odds", icon: LineChart, color: "text-primary" },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Interactive radar particles with sweep detection */}
      <RadarParticles />
      
      {/* Radar-style animated background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Very faint grid pattern - 6% opacity */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,255,218,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,255,218,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.06]" />
        
        {/* Secondary larger grid for depth - 4% opacity */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,255,218,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,255,218,0.02)_1px,transparent_1px)] bg-[size:9rem_9rem] opacity-[0.04]" />
        
        {/* Slow horizontal scan line - 8% opacity */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(100,255,218,0.15)] to-transparent radar-scan-horizontal" />
        </div>
        
        {/* Secondary scan line with offset - 5% opacity */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(100,255,218,0.08)] to-transparent radar-scan-horizontal-slow" />
        </div>
        
        {/* Glowing dots that fade in/out - scattered across page */}
        <div className="absolute inset-0">
          {[
            { top: '15%', left: '10%', delay: '0s', duration: '8s' },
            { top: '25%', left: '85%', delay: '2s', duration: '10s' },
            { top: '45%', left: '20%', delay: '4s', duration: '9s' },
            { top: '60%', left: '75%', delay: '1s', duration: '11s' },
            { top: '75%', left: '40%', delay: '3s', duration: '7s' },
            { top: '35%', left: '60%', delay: '5s', duration: '12s' },
            { top: '85%', left: '15%', delay: '6s', duration: '8s' },
            { top: '20%', left: '50%', delay: '7s', duration: '10s' },
            { top: '55%', left: '90%', delay: '2.5s', duration: '9s' },
            { top: '70%', left: '5%', delay: '4.5s', duration: '11s' },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30 radar-dot-pulse"
              style={{
                top: dot.top,
                left: dot.left,
                animationDelay: dot.delay,
                animationDuration: dot.duration,
              }}
            />
          ))}
        </div>
        
        {/* Subtle radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,255,218,0.04),transparent_60%)]" />
        
        {/* Very subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />
      </div>
      
      {/* Legacy animated background elements - reduced opacity */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        {/* Neural grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
        
        {/* Moving probability lines */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary to-transparent"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                right: 0,
                animation: `sweep ${8 + i * 2}s linear infinite`,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
        </div>

        {/* Elegant rising particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-primary/30 rounded-full"
              style={{
                left: `${5 + i * 6.5}%`,
                bottom: '-10px',
                animation: `rise ${20 + i * 2}s linear infinite`,
                animationDelay: `${i * 1.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero ambient glow - subtle and cinematic */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/8 blur-[100px] rounded-full pointer-events-none opacity-60" />

      {/* Sticky Bar - Clean & Minimal */}
      <div className="sticky top-0 z-[60] bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="container mx-auto px-6 py-2.5">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>Scanning 27 sportsbooks for pricing inefficiencies</span>
          </div>
        </div>
      </div>

      {/* Sticky Nav - $100B Premium glass */}
      <nav className="sticky top-[46px] z-50 backdrop-blur-3xl bg-background/50 border-b border-border/5 shadow-[0_4px_40px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/75 flex items-center justify-center shadow-[0_6px_25px_hsl(var(--primary)/0.25)] transition-all duration-500 group-hover:shadow-[0_10px_40px_hsl(var(--primary)/0.4)] group-hover:scale-105">
              <Network className="h-5 w-5 text-primary-foreground transition-all duration-500 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </div>
            <span className="font-semibold text-lg tracking-tight transition-all duration-400 group-hover:text-primary group-hover:drop-shadow-[0_0_10px_hsl(var(--primary)/0.3)]">MAFS</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection("live-edges")} className="relative text-[13px] text-muted-foreground/70 hover:text-foreground transition-all duration-200 group focus-ring rounded px-1 py-0.5">
              Edge Detection
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary/70 transition-all duration-250 ease-out group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="relative text-[13px] text-muted-foreground/70 hover:text-foreground transition-all duration-200 group focus-ring rounded px-1 py-0.5">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary/70 transition-all duration-250 ease-out group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection("features")} className="relative text-[13px] text-muted-foreground/70 hover:text-foreground transition-all duration-200 group focus-ring rounded px-1 py-0.5">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary/70 transition-all duration-250 ease-out group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection("pricing")} className="relative text-[13px] text-muted-foreground/70 hover:text-foreground transition-all duration-200 group focus-ring rounded px-1 py-0.5">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary/70 transition-all duration-250 ease-out group-hover:w-full" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-[13px] text-muted-foreground/70 hover:text-primary transition-colors duration-300">
              Log in
            </Link>
            <Button asChild className="premium-button px-6 py-3 text-[13px] rounded-xl group">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2.5 opacity-70 transition-transform duration-400 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 md:pt-24 pb-12 px-6">
        {/* Subtle Background Glow - Premium & Understated */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,hsl(var(--primary)/0.06),transparent_60%)]" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge - Understated & Confident */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-6 animate-fade-up">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">The #1 MMA Edge Detection System</span>
            </div>

            {/* Headline - Dominant & Clean */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.03em] mb-6 leading-[1.08] animate-fade-up delay-100">
              <span className="text-foreground">Stop gambling.</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-[hsl(165,70%,45%)] bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 40px hsl(var(--primary) / 0.25))' }}>Start exploiting edges.</span>
            </h1>

            {/* Subheadline - Clarity & Mechanism */}
            <p className="text-lg md:text-xl text-foreground/70 max-w-[680px] mx-auto mb-8 leading-relaxed text-center animate-fade-up delay-200">
              8 AI agents run <span className="text-foreground font-semibold">847,000+ simulations</span> to find <span className="text-foreground font-semibold">mispriced fights</span> before the market corrects.
            </p>
            
            {/* Metrics Bar - Clean & Institutional */}
            <div className="flex flex-col items-center mb-8 animate-fade-up delay-300">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] font-medium mb-3">Real Results</p>
              <div className="inline-flex items-center gap-6 px-6 py-3 rounded-xl bg-muted/30 border border-border/40 hover-lift">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary tabular-nums leading-none">+$24.8K</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide">Avg Yearly</p>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center">
                  <p className="text-xl font-bold tabular-nums leading-none">83%</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide">Hit Rate</p>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <div className="text-center">
                  <p className="text-xl font-bold text-primary tabular-nums leading-none">+18%</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide">ROI</p>
                </div>
              </div>
            </div>

            {/* CTAs - Premium & Clean */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 animate-fade-up delay-400">
              <Button asChild size="lg" className="premium-button text-[15px] px-10 py-6 h-auto min-h-[54px] font-semibold rounded-xl group relative overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.15)] focus-ring">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <span>Get Your Edge</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                onClick={() => scrollToSection("recent-edges")}
                variant="outline"
                size="lg"
                className="text-[15px] px-8 py-6 h-auto min-h-[54px] font-medium rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 group"
              >
                <span>See Live Edges</span>
                <span className="ml-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  5 Live
                </span>
              </Button>
            </div>

            {/* Trust Signals - Subtle */}
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
  <div className="absolute -inset-6 bg-gradient-to-r from-primary/6 via-primary/3 to-primary/6 blur-[50px] rounded-[32px] opacity-50" />
  <div className="relative hover-lift">
    <SimulationDemo />
  </div>
</div>
</div>
</div>
      </section>

      {/* Live Edge Ticker - Urgency */}
      <section className="relative py-4 overflow-hidden border-y border-primary/10 bg-gradient-to-r from-background via-primary/[0.03] to-background">
        <div className={`flex items-center gap-8 smooth-ticker whitespace-nowrap ${newEdgePulse ? 'ticker-pulse' : ''}`}>
          {[...tickerEdges, ...tickerEdges, ...tickerEdges].map((item, idx) => (
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
      </section>

      {/* Stats Strip - Legendary Numbers */}
      <section className="relative border-y border-primary/20 overflow-hidden bg-gradient-to-r from-primary/[0.03] via-primary/[0.08] to-primary/[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4">
            <div ref={simulations.ref} className="py-10 md:py-14 text-center border-r border-primary/15 last:border-r-0 group cursor-default">
              <p className="text-3xl md:text-5xl font-black tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105 text-primary number-animate" style={{ textShadow: '0 0 50px hsl(var(--primary) / 0.5)' }}>{simulations.value}</p>
              <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Simulations Run</p>
            </div>
            <div ref={edgesFound.ref} className="py-10 md:py-14 text-center border-r border-primary/15 last:border-r-0 group cursor-default">
              <p className="text-3xl md:text-5xl font-black text-foreground tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105 number-animate">{edgesFound.value}</p>
              <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Edges Exposed</p>
            </div>
            <div ref={avgROI.ref} className="py-10 md:py-14 text-center border-r border-primary/15 last:border-r-0 group cursor-default">
              <p className="text-3xl md:text-5xl font-black tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105 text-primary number-animate" style={{ textShadow: '0 0 50px hsl(var(--primary) / 0.5)' }}>{avgROI.value}</p>
              <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Avg ROI</p>
            </div>
            <div ref={accuracy.ref} className="py-10 md:py-14 text-center group cursor-default">
              <p className="text-3xl md:text-5xl font-black text-foreground tracking-tight tabular-nums transition-all duration-300 group-hover:scale-105 number-animate">{accuracy.value}</p>
              <p className="text-[10px] text-foreground/60 mt-2.5 uppercase tracking-[0.12em] font-semibold">Hit Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transition Line - Subtle */}
      <div className="text-center py-6 relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <div className="relative inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-background border border-border/50 shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-foreground/80 text-xs font-medium">Live edges detected in the last 24 hours</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Recent AI-Detected Edges Feed */}
      <section id="recent-edges" className="py-14 md:py-20 px-4 relative scroll-section">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_55%)] morphing-blob" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/30 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-60" />
                <Flame className="h-4 w-4 text-amber-500 relative" />
              </div>
              <span className="text-amber-500 text-xs font-black uppercase tracking-wider">5 edges detected right now</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 text-balance tracking-tight">
              Sportsbooks get <span className="text-primary">odds wrong</span>
            </h2>
            <p className="text-base text-foreground/70 text-pretty mb-2">
              Find bets when they do — before the market corrects.
            </p>
            <p className="text-sm text-amber-500 font-bold flex items-center justify-center gap-2">
              <Timer className="h-4 w-4" />
              Edges close fast. Most last 2-6 hours.
            </p>
          </div>

          {/* Edge Feed Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 stagger-fade-in">
            {recentEdgeFeed.map((edge, idx) => (
              <div
                key={idx}
                className="ultra-card p-5 relative group cursor-pointer hover-spotlight"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Top row - Fighter + Confidence */}
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold truncate flex-1 mr-2">{edge.fighter}</p>
                  <span className={`
                    text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0
                    ${edge.confidence === "High" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"}
                  `}>
                    {edge.confidence === "High" ? "Strong" : "Medium"}
                  </span>
                </div>

                {/* Market type */}
                <p className="text-[10px] text-muted-foreground mb-3">{edge.marketType}</p>

                {/* Probability block */}
                <div className="space-y-1.5 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MAFS Prob:</span>
                    <span className="font-mono text-primary font-semibold tabular-nums">{edge.mafsProb}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Prob:</span>
                    <span className="font-mono tabular-nums">{edge.marketProb}%</span>
                  </div>
                </div>

                {/* Edge value - MOST EMPHASIZED with glow */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 mb-4 transition-all duration-400 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:border-primary/35 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-primary/60 font-semibold uppercase tracking-[0.15em]">Edge</span>
                    <span className="text-xl font-bold text-primary tabular-nums transition-all duration-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]">+{edge.edge}%</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                  <span>Detected {edge.detected}</span>
                </div>

                {/* Small footer */}
                <p className="text-[9px] text-muted-foreground/40 mt-2">Based on simulation + market analysis</p>
              </div>
            ))}
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {recentEdgeFeed.map((edge, idx) => (
                <div
                  key={idx}
                  className="terminal-card p-4 w-[280px] flex-shrink-0 snap-start active:scale-[0.98] transition-all duration-200 cursor-pointer hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
                >
                  {/* Top row - Fighter + Confidence */}
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold truncate flex-1 mr-2">{edge.fighter}</p>
                    <span className={`
                      text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0
                      ${edge.confidence === "High" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"}
                    `}>
                      {edge.confidence === "High" ? "Strong" : "Medium"}
                    </span>
                  </div>

                  {/* Market type */}
                  <p className="text-[10px] text-muted-foreground mb-3">{edge.marketType}</p>

                  {/* Probability block */}
                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MAFS Prob:</span>
                      <span className="font-mono text-primary font-semibold">{edge.mafsProb}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Prob:</span>
                      <span className="font-mono">{edge.marketProb}%</span>
                    </div>
                  </div>

                  {/* Edge value - HERO ELEMENT */}
                  <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/30 mb-3 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Edge</span>
                      <span className="text-2xl font-black text-primary tabular-nums" style={{ textShadow: '0 0 25px hsl(var(--primary) / 0.5)' }}>+{edge.edge}%</span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                    <span>Detected {edge.detected}</span>
                  </div>

                  {/* Small footer */}
                  <p className="text-[9px] text-muted-foreground/40 mt-2">Based on simulation + market analysis</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground/50 mb-8">
            These examples reflect how MAFS identifies pricing inefficiencies across markets.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="premium-button">
              <Link href="/dashboard">
                View AI Edge Analysis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">
                Run Free Simulation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Example AI Edge Output Section */}
      <section id="live-edges" className="py-12 md:py-18 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-8">
            {/* Sample Preview Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 mb-4">
              <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Preview</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
              Example AI Edge Output
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              See how mispriced lines appear in the MAFS dashboard.
            </p>
          </div>

          {/* 2 visible cards + 1 locked */}
          <div className="grid lg:grid-cols-3 gap-6">
            {liveEdges.slice(0, 2).map((edge, idx) => (
              <Card key={idx} className="terminal-card group">
                <CardContent className="p-6">
                  {/* Header - Fighter + Market Category */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold">{edge.fighter}</p>
                      <p className="text-sm text-muted-foreground mt-1">Market Category: <span className="text-foreground/70">{edge.marketCategory}</span></p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      edge.confidence === "High" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {edge.confidence}
                    </div>
                  </div>
                  
                  {/* Probability display */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MAFS Probability</span>
                      <span className="font-mono text-primary font-semibold">{edge.modelProb}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Market Probability</span>
                      <span className="font-mono">{edge.marketProb}%</span>
                    </div>
                  </div>
                  
                  {/* Edge indicator */}
                  <div className="p-3 rounded-lg edge-badge">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-primary/70 font-semibold uppercase tracking-wider">Edge Detected</span>
                      {idx === 0 ? (
                        <span className="text-lg font-bold text-primary">+{edge.edge}%</span>
                      ) : (
                        <span className="text-sm font-bold text-primary">Strong Value</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Sample label */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/50 mt-4">
                    <span>Sample Detection</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Locked Premium Card */}
            <Card className="terminal-card relative overflow-hidden">
              <CardContent className="p-6 opacity-40 blur-[2px]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-lg font-bold">Ilia Topuria</p>
                    <p className="text-sm text-muted-foreground mt-1">Market Category: Victory Method</p>
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-semibold bg-primary/20 text-primary">
                    High
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAFS Probability</span>
                    <span className="font-mono text-primary">48%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Market Probability</span>
                    <span className="font-mono">29%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Lock Overlay */}
              <div className="absolute inset-0 bg-background/70 backdrop-blur-[4px] flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-primary text-center mb-2">Premium Edge Detected</p>
                <div className="text-[11px] text-muted-foreground text-left mb-4 space-y-0.5">
                  <p>Members unlock:</p>
                  <p>• Exact bet type</p>
                  <p>• Sportsbook odds</p>
                  <p>• Expected value</p>
                  <p>• Bet sizing</p>
                  <p>• Full model breakdown</p>
                </div>
                <Button asChild className="premium-button text-sm px-4 py-2 h-auto">
                  <Link href="/dashboard">Unlock All Edges</Link>
                </Button>
              </div>
            </Card>
          </div>

          {/* Note below preview */}
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto leading-relaxed mb-4">
              Members unlock exact bet types, sportsbook odds, expected value, and bet sizing recommendations.
            </p>
            <Button asChild className="premium-button">
              <Link href="/dashboard">
                Unlock Full Edge Access
                <Lock className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Most Bettors Lose Section - High Contrast */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-destructive/[0.08] via-background to-background border-y border-destructive/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive/15 border border-destructive/25 mb-5 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-destructive text-xs font-black uppercase tracking-wider">Wake up call</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              97% of bettors are <span className="text-destructive">donating money</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-xl mx-auto font-medium">
              They bet on feelings. MAFS users <span className="text-primary font-bold">only bet when the math says yes.</span>
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Why They Lose - Deeper Red */}
            <div className="p-5 rounded-xl bg-red-950/40 border border-red-900/30">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-red-900/30 flex items-center justify-center">
                  <X className="h-4 w-4 text-red-400" />
                </div>
                <h3 className="font-bold text-red-400">Why They Lose</h3>
              </div>
              <ul className="space-y-2.5">
                {losingBettorReasons.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-muted-foreground/60 text-sm">
                    <X className="h-3.5 w-3.5 text-red-500/50 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* MAFS Approach - Glowing Green */}
            <div className="p-5 rounded-xl bg-primary/10 border border-primary/25 relative overflow-hidden shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-primary">MAFS Approach</h3>
                </div>
                <ul className="space-y-2.5">
                  {mafsAdvantage.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-foreground/85 text-sm font-medium">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="text-center mt-10">
            <span className="text-xl md:text-2xl font-bold text-foreground">The difference?</span>
            <br />
            <span className="text-primary font-bold text-lg">MAFS finds when sportsbooks are wrong.</span>
          </p>
        </div>
      </section>

      {/* Transition Line */}
      <div className="text-center py-3 bg-muted/5">
        <p className="text-muted-foreground/50 text-xs">This is how MAFS finds those edges:</p>
      </div>

      {/* AI War Room - Fight Analysis */}
      <section id="how-it-works" className="py-12 md:py-18 px-4 relative scroll-section">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_65%)]" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 mb-4">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-bold uppercase tracking-wider">Your AI army</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-balance tracking-tight">
              8 AI agents <span className="text-primary">working 24/7</span>
            </h2>
            <p className="text-lg text-foreground/70 text-pretty mb-1">
              Running <span className="text-primary font-semibold">847,000 simulations</span> per fight.
            </p>
            <p className="text-sm text-foreground/50">
              <span className="text-primary font-semibold">When they all agree, you pounce.</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Agent Analysis Panel - Terminal Style */}
            <Card className="terminal-card analysis-terminal">
              <CardContent className="p-6">
                {/* Fighter Visuals */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
                      {fightAnalysis.fighter1.initials}
                    </div>
                    <span className="text-sm font-semibold">{fightAnalysis.fighter1.name}</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-muted-foreground/50">VS</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-mono text-primary">ANALYZING</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-400">
                      {fightAnalysis.fighter2.initials}
                    </div>
                    <span className="text-sm font-semibold">{fightAnalysis.fighter2.name}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {fightAnalysis.agents.map((agent, idx) => (
                    <div 
                      key={agent.name}
                      className={`agent-row flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
                        idx === activeAgent 
                          ? "bg-primary/10 border-primary/30" 
                          : "bg-background/30 border-transparent hover:bg-background/50"
                      }`}
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                        idx === activeAgent ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <agent.icon className={`h-4 w-4 ${idx === activeAgent ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground/90">{agent.name}</span>
                          <span className={`text-sm font-bold ${
                            agent.prediction === "Topuria" ? "text-primary" :
                            agent.prediction === "Makhachev" ? "text-blue-400" : "text-muted-foreground"
                          }`}>
                            {agent.prediction}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                            <div 
                              className={`h-full rounded-full animate-fill-bar ${
                                agent.prediction === "Topuria" ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" :
                                agent.prediction === "Makhachev" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-muted-foreground"
                              }`}
                              style={{ '--bar-width': `${agent.confidence}%`, animationDelay: `${idx * 100}ms` } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-xs font-mono font-semibold text-foreground/70">{agent.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consensus - Brighter, More Energy */}
                <div className="mt-5 p-4 rounded-xl bg-primary/15 border border-primary/40 relative z-10 shadow-[0_0_30px_hsl(var(--primary)/0.25),inset_0_1px_0_hsl(var(--primary)/0.2)]">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)] rounded-xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">Consensus Pick</span>
                      <span className="text-xs text-primary font-bold">{fightAnalysis.consensus.agreementPct}% agreement</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-foreground">{fightAnalysis.consensus.bet}</span>
                      <span className="text-2xl font-mono font-black text-primary" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.6)' }}>{fightAnalysis.consensus.odds}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sharp Money Panel - Terminal Style */}
            <Card className="terminal-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Sharp Money Intelligence</h3>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">Sharp Money Detected</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold">{sharpMoney.fighter}</span>
                    <span className="text-xl font-mono">{sharpMoney.odds}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${sharpMoney.sharpPct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-400">{sharpMoney.sharpPct}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">of sharp bettors backing this line</p>
                </div>

                {/* Line Movement */}
                <div>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Line Movement
                  </h4>
                  <div className="flex items-center justify-between">
                    {sharpMoney.lineHistory.map((point, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`text-lg font-mono font-bold ${
                          idx === sharpMoney.lineHistory.length - 1 ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {point.odds}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{point.time}</div>
                        {idx < sharpMoney.lineHistory.length - 1 && (
                          <div className="absolute" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-muted/30 rounded-md p-3">
                    <div className="line-movement-bar" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

 {/* Past Results / Social Proof */}
  <section className="py-10 md:py-14 px-4 bg-gradient-to-b from-muted/10 to-background">
  <div className="container mx-auto max-w-5xl">
  <div className="text-center max-w-3xl mx-auto mb-10">
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-xl border border-border/30 mb-4">
  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Performance</span>
  </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-balance tracking-tight">
              Real performance. Not theory.
            </h2>
            <p className="text-[15px] text-muted-foreground/80 text-pretty">
              Every pick tracked to measure true edge performance.
            </p>
          </div>

          {/* Results Grid - Tighter, More Data-like */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
            {pastResults.map((result, idx) => (
              <Card key={idx} className={`border transition-all duration-300 ${
                result.result === "WIN" 
                  ? "bg-emerald-500/[0.08] border-emerald-500/25 hover:border-emerald-500/40" 
                  : "bg-red-900/[0.12] border-red-900/25 hover:border-red-900/40"
              }`}>
                <CardContent className="p-3 text-center">
                  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold mb-1.5 ${
                    result.result === "WIN" 
                      ? "bg-emerald-500/25 text-emerald-400" 
                      : "bg-red-900/30 text-red-400"
                  }`}>
                    {result.result === "WIN" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    {result.result}
                  </div>
                  <p className="text-xs font-semibold mb-0.5 truncate">{result.bet}</p>
                  <p className="text-xs font-mono text-muted-foreground mb-1">{result.odds}</p>
                  <p className={`text-sm font-bold font-mono ${
                    result.result === "WIN" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {result.profit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ROI Summary */}
          <div className="flex items-center justify-center gap-8 p-5 rounded-xl bg-gradient-to-r from-background/80 via-muted/25 to-background/80 border border-border/25 max-w-md mx-auto backdrop-blur-xl">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary tracking-tight">+$445</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">Net Profit</p>
            </div>
            <div className="h-10 w-px bg-border/30" />
            <div className="text-center">
              <p className="text-2xl font-semibold tracking-tight">83%</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">Win Rate</p>
            </div>
            <div className="h-10 w-px bg-border/30" />
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary tracking-tight">+18%</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-0.5">ROI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-18 px-4 relative scroll-section">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="floating-badge mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 text-balance tracking-tight">
              Professional-grade tools
            </h2>
            <p className="text-lg text-muted-foreground/70 text-pretty font-light">
              Everything you need to find edges the market hasn&apos;t priced in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Cpu,
                title: "Fight Simulation Engine",
                description: "8 specialized AI agents independently simulate every UFC fight from different analytical angles."
              },
              {
                icon: DollarSign,
                title: "Sharp Money Tracker",
                description: "Analysis of professional betting patterns. Know where the smart money tends to move."
              },
              {
                icon: Target,
                title: "Edge Detection System",
                description: "Scans 27+ sportsbooks to surface probability gaps the market hasn't corrected."
              },
              {
                icon: LineChart,
                title: "Market Line Scanner",
                description: "Odds comparison across all major books. Find the best available lines."
              },
              {
                icon: BarChart3,
                title: "CLV Edge Tracking",
                description: "Track closing line value to measure your true edge against market efficiency."
              },
              {
                icon: Shield,
                title: "Risk-Adjusted Picks",
                description: "Every bet includes confidence scores, variance tags, and clear risk profiles."
              },
            ].map((feature, idx) => (
              <Card key={idx} className="ultra-card group hover-spotlight">
                <CardContent className="p-6 relative">
                  <div className="feature-icon h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center mb-5 transition-all duration-400 group-hover:from-primary/25 group-hover:to-primary/10 group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-primary transition-all duration-400 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 tracking-tight transition-colors duration-300 group-hover:text-primary">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Users Win */}
      <section className="py-12 md:py-16 px-4 border-t border-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_65%)]" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-black uppercase tracking-wider">Dead simple</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">3 steps to <span className="text-primary">profitable betting</span></h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
            
            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-5 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/35 relative">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2 tracking-tight transition-all duration-300 group-hover:text-primary text-lg">Open MAFS</h3>
              <p className="text-sm text-muted-foreground/60">Access AI edge detection dashboard</p>
            </div>
            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-5 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/35 relative">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2 tracking-tight transition-all duration-300 group-hover:text-primary text-lg">View AI-detected edges</h3>
              <p className="text-sm text-muted-foreground/60">See probability gaps across 27+ sportsbooks</p>
            </div>
            <div className="text-center group">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-5 transition-all duration-500 group-hover:scale-110 group-hover:border-primary/35 relative">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2 tracking-tight transition-all duration-300 group-hover:text-primary text-lg">Bet only when edge exists</h3>
              <p className="text-sm text-muted-foreground/60">Place bets with mathematical advantage</p>
            </div>
          </div>
          
          <p className="text-center mt-10 text-muted-foreground/60 text-[15px]">
            Most users find their first profitable edge <span className="text-primary font-semibold">within minutes</span>.
          </p>
        </div>
      </section>

      {/* Testimonials - Social Proof */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-primary/[0.05] to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 mb-6 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-black uppercase tracking-wider">Real winners</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-balance tracking-tight">
              They found <span className="text-primary">their edge</span>
            </h2>
            <p className="text-lg text-foreground/80 font-medium">Verified results from MAFS users. No cherry-picking.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="ultra-card group hover-spotlight">
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary transition-all duration-400 group-hover:scale-110" style={{ transitionDelay: `${i * 60}ms` }} />
                    ))}
                  </div>
                  <p className="text-foreground/85 mb-6 leading-relaxed text-[15px]">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center text-sm font-semibold text-primary transition-all duration-300 group-hover:from-primary/20 group-hover:to-primary/10">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground/60">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/15 to-primary/10 border border-primary/15 text-xs font-semibold text-primary transition-all duration-400 group-hover:scale-105">
                      {testimonial.result}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - ROI Focused */}
      <section id="pricing" className="py-20 md:py-28 px-4 relative scroll-section">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_55%)] morphing-blob" />
        </div>
        
        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 mb-6 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs font-black uppercase tracking-wider">One edge pays for itself</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[3.5rem] font-black mb-4 text-balance tracking-tight">
              <span className="text-primary">$39/mo</span> feels like stealing
            </h2>
            <p className="text-xl text-foreground/80 text-pretty font-medium">
              Users average <span className="text-primary font-bold">$24,800/year</span> in profit. You do the math.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free tier */}
            <Card className="glass-card border-border/30">
              <CardContent className="p-6">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold mb-2">Free</h3>
                  <p className="text-sm text-muted-foreground/70">Perfect for getting started</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold tracking-tight">$0</span>
                  <span className="text-muted-foreground/60 ml-1">/month</span>
                </div>
                <Button asChild variant="outline" className="w-full mb-6 h-12 text-sm rounded-lg group">
                  <Link href="/dashboard">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <div className="space-y-3">
                  {pricingFeatures.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {item.free === true ? (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : item.free === false ? (
                        <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      ) : (
                        <CircleDot className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${item.free === false ? "text-muted-foreground/40" : ""}`}>
                        {item.feature}
                        {typeof item.free === "string" && (
                          <span className="text-muted-foreground/60 ml-1">({item.free})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro tier */}
            <Card className="relative overflow-hidden gradient-border group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" style={{ animation: 'gradient-rotate 10s linear infinite' }} />
              <div className="absolute inset-px rounded-[15px] bg-gradient-to-b from-background/98 to-muted/25 backdrop-blur-2xl" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="absolute top-3 right-3 px-4 py-1.5 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground text-[9px] font-bold uppercase tracking-wider rounded-full shadow-[0_0_25px_hsl(var(--primary)/0.4)]">
                High ROI Tool
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold mb-2">Pro</h3>
                  <p className="text-sm text-muted-foreground/70">For bettors who want a measurable edge.</p>
                </div>
                <div className="mb-2">
                  <span className="text-4xl font-bold tracking-tight">$39</span>
                  <span className="text-muted-foreground/60 ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground/60 mb-4">
                  Most bettors recover their subscription with one good edge.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Average detected edge: +11%</span>
                </div>
                <Button asChild className="w-full premium-button mb-6 h-12 text-sm rounded-lg group">
                  <Link href="/dashboard">
                    Start Pro Trial
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <div className="space-y-3">
                  {pricingFeatures.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        {item.feature}
                        {typeof item.pro === "string" && (
                          <span className="text-primary ml-1">({item.pro})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Risk Reversal Section */}
      <section className="py-12 md:py-16 px-4 border-t border-border/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold mb-8 tracking-tight">Try MAFS risk-free</h3>
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/70">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/8 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[15px]">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/8 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[15px]">No long-term commitment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/8 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[15px]">One edge can cover your subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Legendary Closer */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.2),transparent_50%)] morphing-blob" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(var(--primary)/0.15),transparent_55%)] blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(165,100%,50%,0.1),transparent_60%)] blur-[60px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto max-w-4xl relative">
          <div className="text-center">
            {/* Subtle Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground text-xs font-medium">5 live edges detected</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance tracking-tight leading-[1.1]">
              Stop guessing.
              <br />
              <span className="text-primary">Start finding edges.</span>
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 max-w-xl mx-auto mb-4">
              Join 2,400+ bettors using AI to find mispriced fights.
            </p>
            <p className="text-sm text-muted-foreground/60 max-w-md mx-auto mb-8">
              Free to start. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Button asChild size="lg" className="premium-button text-[15px] px-10 py-6 h-auto min-h-[54px] font-semibold rounded-xl group relative overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.15)] focus-ring">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <span>Get Your Edge</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                onClick={() => scrollToSection("recent-edges")}
                variant="outline"
                size="lg"
                className="text-[15px] px-8 py-6 h-auto min-h-[54px] font-medium rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 group"
              >
                <span>See How It Works</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/10 py-12 px-4 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/75 flex items-center justify-center shadow-[0_4px_20px_hsl(var(--primary)/0.25)] transition-all duration-400 group-hover:shadow-[0_6px_28px_hsl(var(--primary)/0.4)] group-hover:scale-105">
                <Network className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight transition-colors duration-300 group-hover:text-primary">MAFS</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground/60">
              <Link href="/dashboard" className="link-underline hover:text-foreground transition-colors duration-200">Dashboard</Link>
              <button onClick={() => scrollToSection("live-edges")} className="link-underline hover:text-foreground transition-colors duration-200">Edge Detection</button>
              <button onClick={() => scrollToSection("how-it-works")} className="link-underline hover:text-foreground transition-colors duration-200">How It Works</button>
              <button onClick={() => scrollToSection("pricing")} className="link-underline hover:text-foreground transition-colors duration-200">Pricing</button>
            </div>
            <p className="text-sm text-muted-foreground/40">
              {new Date().getFullYear()} MAFS
            </p>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes sweep {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .ticker-pulse {
          animation: tickerPulse 1s ease-out;
        }
        @keyframes tickerPulse {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
          100% { filter: brightness(1); }
        }
      `}</style>
    </div>
  )
}
