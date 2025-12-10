import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Scale, Droplet, Frown, Activity, Clock, TrendingDown } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface RedFlagAlertProps {
  fight: Fight
}

export function RedFlagAlert({ fight }: RedFlagAlertProps) {
  // If no risk flags and not a no-bet, show all clear
  if (fight.risk_flags.length === 0 && !fight.no_bet) {
    return (
      <Card className="bg-linear-to-r from-green-950/30 to-green-900/20 border-green-500/30 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-400">All Clear</h3>
            <p className="text-sm text-gray-400">No significant risk flags detected</p>
          </div>
        </div>
      </Card>
    )
  }

  const getIconForFlag = (flag: string) => {
    if (flag.toLowerCase().includes('weight')) return <Scale className="w-5 h-5" />
    if (flag.toLowerCase().includes('injur')) return <Droplet className="w-5 h-5" />
    if (flag.toLowerCase().includes('camp')) return <Frown className="w-5 h-5" />
    if (flag.toLowerCase().includes('style')) return <Activity className="w-5 h-5" />
    if (flag.toLowerCase().includes('money')) return <TrendingDown className="w-5 h-5" />
    if (flag.toLowerCase().includes('layoff')) return <Clock className="w-5 h-5" />
    return <AlertTriangle className="w-5 h-5" />
  }

  const allFlags = fight.no_bet ? [...fight.risk_flags, ...fight.no_bet_reasons] : fight.risk_flags

  return (
    <Card className="bg-linear-to-r from-red-950/50 to-orange-950/40 border-red-500/40 p-6 animate-glow-pulse-red">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-400">Risk Flags Detected</h3>
            <p className="text-sm text-gray-400">
              {allFlags.length} warning{allFlags.length !== 1 ? 's' : ''} identified
            </p>
          </div>
          {fight.no_bet && (
            <Badge className="ml-auto bg-red-600 text-foreground border-0 text-sm font-bold">
              NO BET
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allFlags.map((flag, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-red-500/20"
            >
              <div className="shrink-0 text-yellow-400 mt-0.5">
                {getIconForFlag(flag)}
              </div>
              <p className="text-sm text-gray-300">{flag}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
