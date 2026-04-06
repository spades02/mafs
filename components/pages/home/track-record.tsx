import { CheckCircle2, XCircle, Clock, Inbox } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TrackResult {
  status: string
  bet: string
  odds: string
  profit: string
  matchupLabel?: string
  pickFighterName?: string | null
}

interface TrackRecordSummary {
  netProfitStr: string
  winRatePct: number
  roiPct: number
}

function TrackRecord({
  pastResults,
  summary,
}: {
  pastResults?: TrackResult[]
  summary?: TrackRecordSummary
}) {
  const rows = pastResults ?? []
  const hasSettled = rows.some(r => r.status === "WIN" || r.status === "LOSS")
  const s = summary ?? { netProfitStr: "—", winRatePct: 0, roiPct: 0 }

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

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <div className="h-14 w-14 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <Inbox className="h-6 w-6 text-muted-foreground/70" />
            </div>
            <p className="text-base font-semibold mb-1">No tracked picks yet</p>
            <p className="text-sm text-muted-foreground/70">
              Settled results will appear here as fights conclude and grades land in the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {rows.map((r, i) => {
              const isWin = r.status === "WIN"
              const isLoss = r.status === "LOSS"
              const isPending = !isWin && !isLoss
              return (
                <Card
                  key={i}
                  className={`glass-card border-border/50 transition-all duration-300 ${
                    isWin ? "result-card-win" : isLoss ? "result-card-loss" : ""
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                        isWin
                          ? "bg-primary/20 text-primary"
                          : isLoss
                          ? "bg-destructive/20 text-destructive"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {isWin ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : isLoss ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {r.status}
                    </div>
                    {r.matchupLabel && (
                      <p className="text-[10px] text-primary/80 font-semibold uppercase tracking-wider mb-1 truncate">{r.matchupLabel}</p>
                    )}
                    <p className="text-sm font-semibold mb-1 leading-tight">
                      {(() => {
                        const last = r.pickFighterName?.split(' ').slice(-1)[0] || ''
                        const bet = r.bet || ''
                        if (last && bet.toLowerCase().includes(last.toLowerCase())) return bet
                        return last ? `${last} · ${bet}` : bet
                      })()}
                    </p>
                    <p className="text-sm font-mono text-muted-foreground mb-2">{r.odds}</p>
                    <p
                      className={`text-sm font-bold font-mono profit-animate ${
                        isWin ? "text-primary" : isLoss ? "text-destructive" : "text-muted-foreground/70"
                      }`}
                    >
                      {r.profit}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {hasSettled && (
          <div className="flex items-center justify-center gap-8 p-6 rounded-xl bg-muted/30 border border-border/50 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{s.netProfitStr}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Profit</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold">{s.winRatePct}%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{s.roiPct >= 0 ? '+' : ''}{s.roiPct}%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">ROI</p>
            </div>
          </div>
        )}

        {!hasSettled && rows.length > 0 && (
          <p className="text-center text-xs text-muted-foreground/60 max-w-md mx-auto">
            Showing recent picks awaiting settlement. Performance summary will appear once fights conclude.
          </p>
        )}
      </div>
    </section>
  )
}

export default TrackRecord
