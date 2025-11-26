"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, AlertCircle } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface EnhancedPropEVGridProps {
  fight: Fight
}

export function EnhancedPropEVGrid({ fight }: EnhancedPropEVGridProps) {
  if (fight.no_bet || fight.best_outcomes.length === 0) {
    return null
  }

  const bestOutcome = fight.best_outcomes.reduce((best, current) => 
    current.ev_percent > best.ev_percent ? current : best
  )

  return (
    <Card className="p-8 bg-linear-to-br from-[#0f1419] to-[#0b0f14] border-white/10 elevation-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-1 h-8 bg-linear-to-b from-cyan-500 to-blue-500 rounded-full" />
          Prop EV Analysis
        </h2>
        <Badge variant="outline" className="text-green-400 border-green-500/30 px-3 py-1">
          {fight.best_outcomes.length} Opportunities
        </Badge>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-white/20">
              <th className="text-left py-4 px-4 text-gray-300 font-bold">PROP TYPE</th>
              <th className="text-center py-4 px-4 text-gray-300 font-bold">MODEL</th>
              <th className="text-center py-4 px-4 text-gray-300 font-bold">MARKET</th>
              <th className="text-center py-4 px-4 text-gray-300 font-bold">EDGE</th>
              <th className="text-center py-4 px-4 text-gray-300 font-bold">EV %</th>
              <th className="text-left py-4 px-4 text-gray-300 font-bold">RATIONALE</th>
            </tr>
          </thead>
          <tbody>
            {fight.best_outcomes.map((outcome, index) => {
              const isBest = outcome === bestOutcome
              const evColor = outcome.ev_percent > 3 ? "text-green-400" : outcome.ev_percent > 0 ? "text-yellow-400" : "text-gray-400"
              const evIcon = outcome.ev_percent > 3 ? TrendingUp : outcome.ev_percent > 0 ? Target : AlertCircle
              const EvIcon = evIcon
              
              return (
                <tr
                  key={index}
                  className={`border-b border-white/5 transition-all duration-300 ${
                    isBest 
                      ? 'bg-green-500/10 hover:bg-green-500/15 border-l-4 border-l-green-500' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-5 px-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      {isBest && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {outcome.selection}
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className="text-blue-400 font-bold text-base">{outcome.model_prob}%</span>
                  </td>
                  <td className="py-5 px-4 text-center text-gray-400 font-medium">{outcome.market_implied}%</td>
                  <td className="py-5 px-4 text-center">
                    <Badge variant="outline" className="text-sm border-cyan-500/40 text-cyan-400 font-bold">
                      +{outcome.edge_pts}pts
                    </Badge>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <EvIcon className={`w-4 h-4 ${evColor}`} />
                      <span className={`font-bold text-lg ${evColor}`}>
                        +{outcome.ev_percent.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-gray-300 text-xs leading-relaxed max-w-md">{outcome.rationale}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
