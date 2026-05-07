import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FoundingMemberCounter } from "@/components/pages/home/founding-member-counter"

const freeFeatures = [
  { name: "3 Free Premium Picks", available: true },
  { name: "Full MAFS Simulation Engine", available: true },
  { name: "Real Edge Detection", available: true },
  { name: "AI-generated fight predictions", available: true },
  { name: "Limited edge analysis", available: false },
  { name: "Limited betting insights", available: false },
  { name: "AI Gameplan Engine", available: false },
  { name: "Bankroll optimization", available: false },
]

const proFeatures = [
  "Unlimited simulation runs",
  "Unlimited fight analysis",
  "AI confidence scoring",
  "Edge detection system",
  "Smart ticket recommendations",
  "Simulation history",
  "Saved plays",
]

const eliteFeatures = [
  "Automated 1,000 weekly simulations",
  "AI Gameplan portfolio builder",
  "Automated betting intelligence",
  "Top recurring outcome detection",
  "AI-generated betting slips",
  "Bankroll optimization",
  "Kelly-based stake sizing",
  "Portfolio risk balancing",
]

interface PricingSectionProps {
  isAuthenticated?: boolean
}

function PricingSection({ isAuthenticated = false }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Choose Your AI Gameplan</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            {isAuthenticated ? "Unlock unlimited edge detection." : "Start free. Upgrade when ready."}
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Professional-grade AI simulation infrastructure for serious betting strategy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Free Plan */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm">Perfect for getting started</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <div key={f.name} className="flex items-center gap-3 text-sm">
                    {f.available ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    )}
                    <span className={f.available ? "" : "text-muted-foreground/50"}>{f.name}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full glass-button" asChild>
                <Link href="/dashboard">{isAuthenticated ? "Current Plan" : "Start Free"}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="terminal-card border-primary/30 relative overflow-hidden pro-card-glow">
            <div className="absolute -inset-px bg-gradient-to-b from-primary/30 via-transparent to-primary/20 rounded-xl pointer-events-none" />
            <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg">
              POPULAR
            </div>
            <CardContent className="p-8 relative">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Founding Member Pricing</p>
              </div>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">$69</span>
                <span className="text-4xl font-bold">$39</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs font-semibold text-primary mb-3">First 100 Users</p>
              <FoundingMemberCounter className="mb-6" />
              <div className="space-y-3 mb-8">
                {proFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full premium-button premium-button-enhanced" asChild>
                <Link href={isAuthenticated ? "/billing" : "/dashboard"}>
                  {isAuthenticated ? "Unlock Unlimited" : "Start Pro"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Elite Plan */}
          <Card className="terminal-card border-primary/40 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-b from-primary/40 via-transparent to-primary/10 rounded-xl pointer-events-none" />
            <div className="absolute top-0 right-0 px-4 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-bl-lg">
              MOST ADVANCED
            </div>
            <CardContent className="p-8 relative">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Elite</h3>
                <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Founding Member Pricing</p>
              </div>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">$149</span>
                <span className="text-4xl font-bold text-primary">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                MAFS automatically runs 1,000 simulations weekly and builds the highest-EV betting portfolio for you.
              </p>
              <div className="space-y-3 mb-8">
                {eliteFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full premium-button premium-button-enhanced" asChild>
                <Link href={isAuthenticated ? "/billing?plan=elite" : "/dashboard"}>
                  Activate AI Gameplan
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
