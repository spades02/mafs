import { CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const results = [
  { status: "WIN", bet: "Topuria KO", odds: "+210", profit: "+$210" },
  { status: "WIN", bet: "Pereira ML", odds: "-120", profit: "+$83" },
  { status: "WIN", bet: "Yan Over 2.5", odds: "+105", profit: "+$105" },
  { status: "WIN", bet: "Sterling ML", odds: "-180", profit: "+$56" },
  { status: "LOSS", bet: "Holloway Dec", odds: "+140", profit: "-$100" },
  { status: "WIN", bet: "Tsarukyan ML", odds: "-110", profit: "+$91" },
]

function TrackRecord() {
  return (
    <section className="py-20 md:py-28 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Track Record</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">Recent AI Edges</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Transparent results from our edge detection system. Every pick, every outcome.
          </p>
        </div>

        {/* Result Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {results.map((r, i) => (
            <Card
              key={i}
              className={`glass-card border-border/50 transition-all duration-300 ${
                r.status === "WIN" ? "result-card-win" : "result-card-loss"
              }`}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                    r.status === "WIN"
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {r.status === "WIN" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {r.status}
                </div>
                <p className="text-sm font-semibold mb-1">{r.bet}</p>
                <p className="text-sm font-mono text-muted-foreground mb-2">{r.odds}</p>
                <p
                  className={`text-sm font-bold font-mono profit-animate ${
                    r.status === "WIN" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {r.profit}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-center gap-8 p-6 rounded-xl bg-muted/30 border border-border/50 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">+$445</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Profit</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">83%</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">+18%</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">ROI</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrackRecord
