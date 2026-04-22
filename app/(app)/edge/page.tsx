import { Brain, ScanLine, Target, Heart, Clock3, Sparkles, TrendingUp } from "lucide-react"
import { getEdgePerformance } from "./actions"
import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cn } from "@/lib/utils"
import { ProfitChart } from "@/components/pages/edge/profit-chart"
import { BetLog } from "@/components/pages/edge/bet-log"

export const dynamic = "force-dynamic"

function fmtDollars(n: number, opts: { showSign?: boolean } = {}): string {
  const showSign = opts.showSign ?? false
  const sign = n >= 0 ? (showSign ? "+" : "") : "-"
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}

function fmtSignedPct(n: number, digits = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`
}

function fmtSignedUnits(n: number, digits = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}`
}

export default async function EdgePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/auth/login?redirect=/edge")

  const perf = await getEdgePerformance()
  const hasData = perf.totalGraded > 0

  const profitColor = perf.profitDollars >= 0 ? "text-emerald-400" : "text-red-400"
  const winRateLeft = Math.max(0, Math.min(100, perf.winRate))
  const winRateRight = 100 - winRateLeft

  return (
    <div className="min-h-screen premium-bg neural-bg">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <section className="rounded-2xl border border-white/5 bg-[#0A0C10] p-8 sm:p-10 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.08),transparent_60%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-widest text-primary font-bold mb-4">
              <TrendingUp className="w-3 h-3" />
              Live Tracked Performance
            </div>
            <p
              className={cn(
                "text-5xl sm:text-6xl font-bold tabular-nums leading-none mb-3 drop-shadow-[0_0_24px_rgba(52,211,153,0.35)]",
                profitColor,
              )}
            >
              {hasData ? fmtDollars(perf.profitDollars, { showSign: true }) : "$0"}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              If you followed every MAFS pick, this is your account. Every fight graded — no cherry-picking.
            </p>
          </div>
        </section>

        {/* Headline stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-5">
            <p className="text-3xl font-bold text-emerald-400 tabular-nums">
              {hasData ? fmtPct(perf.winRate, 0) : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">Bets We Nailed</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-5">
            <p
              className={cn(
                "text-3xl font-bold tabular-nums",
                perf.roiPct >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {hasData ? fmtSignedPct(perf.roiPct, 1) : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">Avg ROI</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-5">
            <p className="text-3xl font-bold text-white tabular-nums">
              {hasData ? perf.totalGraded.toLocaleString() : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">Bets Tracked</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-5">
            <p
              className={cn(
                "text-3xl font-bold tabular-nums",
                perf.profitUnits >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {hasData ? fmtSignedUnits(perf.profitUnits, 1) : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2">Units Won</p>
          </div>
        </section>

        {/* Why This Makes Money */}
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Why This Makes Money</h2>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Sportsbooks aren&apos;t perfect — and we&apos;re built to find the gaps.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <ExplainerCard
              icon={<Heart className="w-5 h-5" />}
              accent="bg-rose-500/10 text-rose-400 border-rose-500/30"
              title="People Bet Emotionally"
              body="Public money chases hype, hometown fighters, and recency bias. Lines drift away from true odds — that gap is profit."
            />
            <ExplainerCard
              icon={<Clock3 className="w-5 h-5" />}
              accent="bg-amber-500/10 text-amber-400 border-amber-500/30"
              title="Sportsbooks Adjust Slowly"
              body="Books react to action, not always to information. By the time the line moves, the edge is already in the book."
            />
            <ExplainerCard
              icon={<Sparkles className="w-5 h-5" />}
              accent="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              title="MAFS Finds Mistakes"
              body="Our model prices every market and only flags bets where our true probability beats the implied odds — by enough to matter."
            />
          </div>
        </section>

        {/* How MAFS Finds Winning Bets */}
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">How MAFS Finds Winning Bets</h2>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Not luck. Not vibes. Just relentless, data-driven probability hunting.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <ExplainerCard
              icon={<ScanLine className="w-5 h-5" />}
              accent="bg-primary/10 text-primary border-primary/30"
              title="Scans Thousands of Data Points"
              body="Stats, styles, layoffs, weight cuts, fight IQ, training camp shifts — all parsed in seconds."
            />
            <ExplainerCard
              icon={<Brain className="w-5 h-5" />}
              accent="bg-violet-500/10 text-violet-300 border-violet-500/30"
              title="Calculates True Probability"
              body="Specialized agents simulate the fight thousands of times to estimate the real chance of every outcome."
            />
            <ExplainerCard
              icon={<Target className="w-5 h-5" />}
              accent="bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
              title="Finds Mispriced Lines"
              body="We compare our true probability to the book&apos;s implied probability — and only act when the edge is meaningful."
            />
          </div>
        </section>

        {/* Profit Chart */}
        <section className="mb-10">
          <ProfitChart series={perf.profitSeries} />
        </section>

        {/* Beating the Market + Bankroll */}
        <section className="grid lg:grid-cols-2 gap-4 mb-10">
          <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-white text-center mb-4">
              Beating the Market = Winning Long-Term
            </h2>
            <p
              className={cn(
                "text-5xl sm:text-6xl font-bold tabular-nums text-center leading-none",
                "text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.35)]",
              )}
            >
              {hasData ? fmtPct(perf.winRate, 0) : "—"}
            </p>
            <p className="text-sm text-muted-foreground/80 text-center mt-3 mb-6">
              We beat the true odds most of the time.
            </p>
            <div className="h-3 w-full rounded-full overflow-hidden bg-white/[0.04] border border-white/5 flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${winRateLeft}%` }}
                aria-label={`Positive bets ${winRateLeft.toFixed(0)}%`}
              />
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400"
                style={{ width: `${winRateRight}%` }}
                aria-label={`Negative bets ${winRateRight.toFixed(0)}%`}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/70">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Positive Bets {winRateLeft.toFixed(0)}%
              </span>
              <span className="flex items-center gap-1.5">
                Negative {winRateRight.toFixed(0)}%
                <span className="w-2 h-2 rounded-full bg-red-400" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-6 sm:p-8 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 text-center mb-3">
              ${perf.startingBankroll.toLocaleString()} starting bankroll grown via this strategy
            </p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-2xl sm:text-3xl font-semibold text-muted-foreground/70 tabular-nums">
                {fmtDollars(perf.startingBankroll)}
              </p>
              <span className="text-muted-foreground/40 text-2xl">→</span>
              <p
                className={cn(
                  "text-3xl sm:text-4xl font-bold tabular-nums",
                  perf.endingBankroll >= perf.startingBankroll ? "text-emerald-400" : "text-red-400",
                )}
              >
                {fmtDollars(perf.endingBankroll)}
              </p>
            </div>
            <p
              className={cn(
                "text-center mt-4 text-base font-bold tabular-nums",
                perf.bankrollReturnPct >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {fmtSignedPct(perf.bankrollReturnPct, 1)} return
            </p>
            <p className="text-center text-xs text-muted-foreground/60 mt-1">
              Based on {perf.totalGraded.toLocaleString()} graded picks at ${perf.unitSizeDollars}/unit.
            </p>
          </div>
        </section>

        {/* Bet Log */}
        <section className="mb-12">
          <BetLog picks={perf.picks} />
        </section>
      </main>
    </div>
  )
}

function ExplainerCard({
  icon,
  accent,
  title,
  body,
}: {
  icon: React.ReactNode
  accent: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-5">
      <div
        className={cn(
          "inline-flex items-center justify-center w-10 h-10 rounded-lg border mb-3",
          accent,
        )}
      >
        {icon}
      </div>
      <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed">{body}</p>
    </div>
  )
}
