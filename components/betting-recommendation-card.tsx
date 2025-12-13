"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Zap, AlertTriangle, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface BettingRecommendationCardProps {
  fight: Fight
}

export function BettingRecommendationCard({ fight }: BettingRecommendationCardProps) {
  const bestML = fight.best_outcomes.find(o => o.market === "Moneyline")
  const bestProp = fight.best_outcomes.find(o => o.market !== "Moneyline") || fight.best_outcomes[0]
  const highestEV = fight.best_outcomes.reduce((best, current) => 
    current.ev_percent > best.ev_percent ? current : best, fight.best_outcomes[0]
  )

  return (
    <Card className="p-8 bg-linear-to-br from-[#0f1419] via-[#0b0f14] to-[#0f1419] border-foreground/10 elevation-lg relative overflow-hidden">
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-500 via-blue-500 to-purple-500" />
      
      <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
        <div className="w-1 h-8 bg-linear-to-b from-green-500 to-emerald-500 rounded-full" />
        AI Betting Slip Recommendation
      </h2>

      {fight.no_bet ? (
        <div className="flex items-center gap-4 p-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg">
          <XCircle className="w-12 h-12 text-red-400 shrink-0" />
          <div>
            <p className="text-xl font-bold text-red-400 mb-2">NO BET RECOMMENDED</p>
            <p className="text-sm text-gray-400">{fight.no_bet_reasons[0]}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Best ML */}
          {bestML && (
            <div className="p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <p className="text-sm font-bold text-blue-400">BEST MONEYLINE</p>
              </div>
              <p className="text-lg font-bold text-foreground mb-2">{bestML.selection}</p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Confidence</p>
                  <p className="text-xl font-bold text-green-400">{bestML.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-400">EV</p>
                  <p className="text-xl font-bold text-cyan-400">+{bestML.ev_percent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Best Prop */}
          {bestProp && (
            <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-lg hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-green-400" />
                <p className="text-sm font-bold text-green-400">BEST PROP</p>
              </div>
              <p className="text-lg font-bold text-foreground mb-2">{bestProp.selection}</p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Confidence</p>
                  <p className="text-xl font-bold text-green-400">{bestProp.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-400">EV</p>
                  <p className="text-xl font-bold text-cyan-400">+{bestProp.ev_percent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* High EV Angle */}
          {highestEV && (
            <div className="p-6 bg-purple-500/10 border-2 border-purple-500/30 rounded-lg hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
                <p className="text-sm font-bold text-purple-400">HIGH-EV ANGLE</p>
              </div>
              <p className="text-lg font-bold text-foreground mb-2">{highestEV.selection}</p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Confidence</p>
                  <p className="text-xl font-bold text-green-400">{highestEV.confidence}%</p>
                </div>
                <div>
                  <p className="text-gray-400">EV</p>
                  <p className="text-xl font-bold text-cyan-400">+{highestEV.ev_percent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No-Bet Flags / Overall Risk */}
      <div className="mt-8 pt-6 border-t border-foreground/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className="text-sm font-bold text-gray-300">Risk Flags</p>
            </div>
            {fight.risk_flags.length > 0 ? (
              <div className="space-y-2">
                {fight.risk_flags.map((flag, idx) => (
                  <Badge key={idx} variant="outline" className="text-yellow-400 border-yellow-500/30">
                    {flag}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm">No significant risk flags</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <p className="text-sm font-bold text-gray-300">Overall Risk</p>
            </div>
            <Badge variant="outline" className={
              fight.volatility === "Low" ? "text-green-400 border-green-500/30 text-lg px-4 py-2" :
              fight.volatility === "Medium" ? "text-yellow-400 border-yellow-500/30 text-lg px-4 py-2" :
              "text-red-400 border-red-500/30 text-lg px-4 py-2"
            }>
              {fight.volatility} Volatility
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
