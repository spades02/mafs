import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FoundingMemberCounter } from "@/components/pages/home/founding-member-counter"

const freeFeatures = [
  { name: "3 Free Premium Picks", available: true, note: null },
  { name: "Full MAFS Simulation Engine", available: true, note: null },
  { name: "Real Edge Detection", available: true, note: null },
  { name: "Market Line Scanner", available: true, note: "(5 books)" },
  { name: "Sharp Money Tracker", available: false, note: null },
  { name: "CLV Edge Tracking", available: false, note: null },
  { name: "Risk-Adjusted Picks", available: false, note: null },
  { name: "Priority Support", available: false, note: null },
]

const proFeatures = [
  { name: "Unlimited Premium Picks", note: null },
  { name: "Full MAFS Simulation Engine", note: null },
  { name: "Edge Detection System", note: "(Unlimited)" },
  { name: "Sharp Money Tracker", note: null },
  { name: "CLV Edge Tracking", note: null },
  { name: "Market Line Scanner", note: "(27+ books)" },
  { name: "Risk-Adjusted Picks", note: null },
  { name: "Priority Support", note: null },
]

interface PricingSectionProps {
  isAuthenticated?: boolean
}

function PricingSection({ isAuthenticated = false }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            {isAuthenticated ? "Unlock unlimited edge detection." : "Start free. Upgrade when ready."}
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            {isAuthenticated
              ? "Upgrade to Pro to unlock all edges, full model breakdowns, and sharp money tracking."
              : "Try MAFS with no commitment. Upgrade to Pro when you\u2019re ready for unlimited edge detection."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="space-y-4 mb-8">
                {freeFeatures.map((f) => (
                  <div key={f.name} className="flex items-center gap-3">
                    {f.available ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    )}
                    <span className={f.available ? "" : "text-muted-foreground/50"}>
                      {f.name}
                      {f.note && <span className="text-muted-foreground ml-1">{f.note}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full glass-button" asChild>
                <Link href="/dashboard">{isAuthenticated ? "Current Plan" : "Get Started"}</Link>
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
                <p className="text-muted-foreground">For serious bettors</p>
              </div>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">$69</span>
                <span className="text-4xl font-bold">$39</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <span className="text-xs font-semibold text-primary">Founding Member Pricing — First 100 Users</span>
              </div>
              <FoundingMemberCounter className="mb-6" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="text-xs font-semibold text-primary">Average detected edge: +11%</span>
              </div>
              <div className="space-y-4 mb-8">
                {proFeatures.map((f) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      {f.name}
                      {f.note && <span className="text-primary ml-1">{f.note}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full premium-button premium-button-enhanced" asChild>
                <Link href={isAuthenticated ? "/billing" : "/dashboard"}>{isAuthenticated ? "Upgrade to Pro" : "Start Pro Trial"}</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Most bettors recover their subscription with one good edge.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
