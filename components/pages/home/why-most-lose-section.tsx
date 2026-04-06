import { TrendingDown, X, CheckCircle2, Check } from "lucide-react"

const losingBettorReasons = [
  "Betting narratives",
  "Twitter picks",
  "Gut feeling decisions",
  "No mathematical edge",
]

const mafsAdvantage = [
  "Multi-agent fight simulation",
  "Statistical probability modeling",
  "Pricing gap detection",
  "Only bet when the math favors you",
]

function WhyMostLoseSection() {
  return (
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
          <div className="p-5 rounded-xl bg-red-950/40 border border-red-900/30">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-red-900/30 flex items-center justify-center">
                <X className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="font-bold text-red-400">Why They Lose</h3>
            </div>
            <ul className="space-y-2.5">
              {losingBettorReasons.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-muted-foreground/60 text-sm">
                  <X className="h-3.5 w-3.5 text-red-500/50 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

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
                {mafsAdvantage.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-foreground/85 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' }} />
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
  )
}

export default WhyMostLoseSection
