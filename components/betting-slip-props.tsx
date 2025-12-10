"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, TrendingUp, AlertCircle } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface BettingSlipPropsProps {
  fight: Fight
}

export function BettingSlipProps({ fight }: BettingSlipPropsProps) {
  const topProps = fight.best_outcomes.slice(0, 3)

  const getRankData = (rank: number) => {
    if (rank === 0) return { 
      icon: Trophy, 
      color: 'text-yellow-400', 
      bg: 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/20', 
      border: 'border-yellow-500/40',
      glow: 'animate-glow-pulse-yellow'
    }
    if (rank === 1) return { 
      icon: Medal, 
      color: 'text-gray-300', 
      bg: 'bg-gradient-to-br from-gray-800/40 to-gray-700/20', 
      border: 'border-gray-400/30',
      glow: ''
    }
    return { 
      icon: Award, 
      color: 'text-orange-400', 
      bg: 'bg-gradient-to-br from-orange-900/40 to-orange-800/20', 
      border: 'border-orange-500/30',
      glow: ''
    }
  }

  if (topProps.length === 0) return null

  return (
    <Card className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border-foreground/10 p-8 elevation-lg">
      <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
        <div className="w-1 h-8 bg-linear-to-b from-green-500 to-emerald-500 rounded-full" />
        Top Value Props
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {topProps.map((outcome, idx) => {
          const rankData = getRankData(idx)
          const Icon = rankData.icon
          
          return (
            <Card 
              key={idx}
              className={`${rankData.bg} ${rankData.border} border-2 p-6 hover-lift ${rankData.glow} ${idx === 0 ? 'lg:scale-105' : ''} transition-all duration-300`}
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className={`${rankData.color} border-current text-sm font-bold px-3 py-1`}>
                  #{idx + 1} PICK
                </Badge>
                <Icon className={`w-7 h-7 ${rankData.color}`} />
              </div>

              {/* Pick */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">SELECTION</p>
                <p className="text-xl font-bold text-foreground leading-tight">{outcome.selection}</p>
              </div>

              {/* Confidence Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400">CONFIDENCE</p>
                  <p className={`text-lg font-bold ${
                    outcome.confidence >= 75 ? 'text-green-400' :
                    outcome.confidence >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {outcome.confidence}%
                  </p>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      outcome.confidence >= 75 ? 'bg-green-500' :
                      outcome.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${outcome.confidence}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">EV%</p>
                  <p className={`text-2xl font-bold ${
                    outcome.ev_percent > 3 ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    +{outcome.ev_percent.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">EDGE</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    +{outcome.edge_pts}pts
                  </p>
                </div>
              </div>

              {/* Volatility */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">VOLATILITY</p>
                <Badge variant="outline" className={
                  fight.volatility === "Low" ? "text-green-400 border-green-500/30" :
                  fight.volatility === "Medium" ? "text-yellow-400 border-yellow-500/30" :
                  "text-red-400 border-red-500/30"
                }>
                  {fight.volatility}
                </Badge>
              </div>

              {/* Rationale */}
              <div className="pt-4 border-t border-foreground/10">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">{outcome.rationale}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
