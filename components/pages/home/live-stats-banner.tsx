import { Radar } from "lucide-react"

const stats = [
  { value: "847,293", label: "Simulations Run", color: "text-foreground" },
  { value: "12,847", label: "Edges Found", color: "text-primary" },
  { value: "+18%", label: "Avg ROI", color: "text-foreground" },
  { value: "71%", label: "Edge Accuracy", color: "text-foreground" },
]

function LiveStatsBanner() {
  return (
    <section className="border-b border-border/50 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
          {stats.map((stat) => (
            <div key={stat.label} className="py-8 md:py-10 text-center">
              <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sportsbooks scanned banner */}
      <div className="flex items-center justify-center py-4 border-t border-border/30">
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30">
          <Radar className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">27+ sportsbooks scanned every minute</span>
        </div>
      </div>
    </section>
  )
}

export default LiveStatsBanner
