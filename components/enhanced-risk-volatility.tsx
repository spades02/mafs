"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Activity, Target } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface EnhancedRiskVolatilityProps {
  fight: Fight
}

export function EnhancedRiskVolatility({ fight }: EnhancedRiskVolatilityProps) {
  const volatilityData = {
    Low: { color: 'text-green-400', bg: 'bg-green-500/20', value: 30 },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', value: 60 },
    High: { color: 'text-red-400', bg: 'bg-red-500/20', value: 90 },
  }
  
  const data = volatilityData[fight.volatility]
  
  // Mock finish probabilities
  const finishProbs = [
    { label: "KO/TKO", value: 35, color: "text-red-400", bg: "bg-red-500" },
    { label: "Submission", value: 15, color: "text-yellow-400", bg: "bg-yellow-500" },
    { label: "Decision", value: 50, color: "text-blue-400", bg: "bg-blue-500" },
  ]

  // Donut chart calculation
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (data.value / 100) * circumference

  return (
    <Card className="p-8 bg-linear-to-br from-[#0f1419] to-[#0b0f14] border-foreground/10 elevation-lg">
      <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
        <div className="w-1 h-8 bg-linear-to-b from-orange-500 to-red-500 rounded-full" />
        Risk & Volatility
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volatility Meter with Donut Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 mb-6">
            <svg className="transform -rotate-90 w-full h-full">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke={data.bg.replace('bg-', '').replace('/20', '')}
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  stroke: data.color.includes('green') ? '#22c55e' : 
                          data.color.includes('yellow') ? '#eab308' : '#ef4444'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className={`text-4xl font-bold ${data.color}`}>{data.value}</p>
              <p className="text-xs text-gray-400 mt-1">Risk Score</p>
            </div>
          </div>
          
          <Badge variant="outline" className={`${data.color} border-current text-lg font-bold px-4 py-2`}>
            {fight.volatility} Volatility
          </Badge>
          
          {fight.risk_flags.length > 0 && (
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-400">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p>{fight.risk_flags[0]}</p>
            </div>
          )}
        </div>

        {/* Finish Probability Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Finish Probability
          </h3>
          
          <div className="space-y-6">
            {finishProbs.map((prob, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">{prob.label}</span>
                  <span className={`text-2xl font-bold ${prob.color}`}>{prob.value}%</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${prob.bg} transition-all duration-1000 ease-out`}
                    style={{ width: `${prob.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Risk Meter */}
          <div className="mt-8 pt-6 border-t border-foreground/10">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Durability Index</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000" style={{ width: "75%" }} />
              </div>
              <span className="text-xl font-bold text-foreground">75</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
