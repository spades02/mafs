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
    <section className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Performance</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Real performance. Not theory.</h2>
          <p className="text-base text-muted-foreground/70">
            Every pick tracked to measure true edge performance.
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-16">
            {rows.map((r, i) => {
              const isWin = r.status === "WIN"
              const isLoss = r.status === "LOSS"
              const isPending = !isWin && !isLoss
              
              const titleName = (() => {
                 const last = r.pickFighterName?.split(' ').slice(-1)[0] || ''
                 const bet = r.bet || ''
                 if (last && bet.toLowerCase().includes(last.toLowerCase())) return bet
                 return last ? `${last} ${bet}` : bet
              })()

              return (
                <Card
                  key={i}
                  className={`ultra-card transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center py-8 px-4 ${
                    isWin ? "border-primary/20 bg-primary/5" : isLoss ? "border-destructive/20 bg-destructive/5" : "border-border/50"
                  }`}
                >
                  {isWin && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_70%)] pointer-events-none" />}
                  {isLoss && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,hsl(var(--destructive)/0.05),transparent_70%)] pointer-events-none" />}
                  
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold mb-4 uppercase tracking-widest ${
                        isWin
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : isLoss
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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

                    <p className="text-base md:text-lg font-bold text-foreground/90 mb-1 leading-tight text-center">
                      {titleName}
                    </p>
                    <p className="text-sm font-mono text-muted-foreground/60 mb-2">{r.odds}</p>
                    <p
                      className={`text-lg md:text-xl font-bold font-mono tracking-tight profit-animate ${
                        isWin ? "text-primary" : isLoss ? "text-destructive" : "text-muted-foreground/70"
                      }`}
                    >
                      {r.profit}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {hasSettled && (
          <div className="flex items-center justify-between md:justify-center md:gap-24 px-4 max-w-2xl mx-auto">
            <div className="text-center flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tighter mb-2">{s.netProfitStr}</p>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.1em] font-medium">Net Profit</p>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground/90 mb-2">{s.winRatePct}%</p>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.1em] font-medium">Win Rate</p>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tighter mb-2">{s.roiPct >= 0 ? '+' : ''}{s.roiPct}%</p>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.1em] font-medium">ROI</p>
            </div>
          </div>
        )}

        {!hasSettled && rows.length > 0 && (
          <p className="text-center text-xs text-muted-foreground/60 max-w-md mx-auto mt-8">
            Showing recent picks awaiting settlement. Performance summary will appear once fights conclude.
          </p>
        )}
      </div>
    </section>
  )
}

export default TrackRecord
