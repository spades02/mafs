import Link from "next/link"
import { Play, Eye, LayoutDashboard, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface FinalCTAProps {
  isPro?: boolean
  isAuthenticated?: boolean
}

function FinalCTA({ isPro = false, isAuthenticated = false }: FinalCTAProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-muted/20">
      <div className="container mx-auto max-w-4xl">
        <div className="relative cta-glow">
          <div className="absolute -inset-8 bg-primary/15 blur-[60px] rounded-3xl" />
          <Card className="terminal-card border-primary/30 relative overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute inset-0 h-2 w-2 rounded-full bg-primary animate-ping opacity-75" />
                </div>
                <span className="text-sm font-medium text-primary">Live simulation running now</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
                {isAuthenticated ? "Your edge scanner is live." : "Ready to find your edge?"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
                {isAuthenticated
                  ? isPro
                    ? "All markets unlocked. Head to your dashboard to see today\u2019s AI-detected edges."
                    : "Upgrade to Pro to unlock all edges, or run a free simulation now."
                  : "Join bettors using AI-driven fight simulations to detect mispriced UFC bets before sportsbooks adjust."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Button className="premium-button premium-button-enhanced text-base px-8 py-6 h-auto" asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Link>
                    </Button>
                    {!isPro && (
                      <Button variant="outline" className="glass-button hover:bg-primary/5 text-base px-8 py-6 h-auto" asChild>
                        <Link href="/billing">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button className="premium-button premium-button-enhanced text-base px-8 py-6 h-auto" asChild>
                      <Link href="/dashboard">
                        <Play className="h-4 w-4 mr-2" />
                        Run Free Simulation
                      </Link>
                    </Button>
                    <Button variant="outline" className="glass-button hover:bg-primary/5 text-base px-8 py-6 h-auto" asChild>
                      <Link href="/dashboard">
                        <Eye className="h-4 w-4 mr-2" />
                        View Live Edges
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
