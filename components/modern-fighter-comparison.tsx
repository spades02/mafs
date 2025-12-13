"use client"

import { Card } from "@/components/ui/card"
import { Target, Shield, Zap, Heart, Gauge, TrendingUp } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface ModernFighterComparisonProps {
  fight: Fight
}

interface Attribute {
  icon: React.ElementType
  label: string
  fighterA: number
  fighterB: number
}

export function ModernFighterComparison({ fight }: ModernFighterComparisonProps) {
  const [fighterA, fighterB] = fight.matchup.split(" vs. ")
  
  const attributes: Attribute[] = [
    { icon: Target, label: "Striking", fighterA: 85, fighterB: 72 },
    { icon: Shield, label: "Defense", fighterA: 78, fighterB: 81 },
    { icon: Zap, label: "Power", fighterA: 92, fighterB: 68 },
    { icon: Heart, label: "Cardio", fighterA: 75, fighterB: 88 },
    { icon: Gauge, label: "Grappling", fighterA: 70, fighterB: 75 },
    { icon: TrendingUp, label: "Momentum", fighterA: 88, fighterB: 65 },
  ]

  return (
    <Card className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border-foreground/10 p-8 elevation-lg">
      <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
        <div className="w-1 h-8 bg-linear-to-b from-blue-500 to-cyan-500 rounded-full" />
        Fighter Attribute Comparison
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-2xl font-bold text-blue-400 mb-1">{fighterA}</p>
          <p className="text-xs text-gray-400">Fighter A</p>
        </div>
        <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-2xl font-bold text-red-400 mb-1">{fighterB}</p>
          <p className="text-xs text-gray-400">Fighter B</p>
        </div>
      </div>

      <div className="space-y-8">
        {attributes.map((attr, idx) => {
          const Icon = attr.icon
          const maxValue = Math.max(attr.fighterA, attr.fighterB)
          const aAdvantage = attr.fighterA > attr.fighterB
          
          return (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <p className="text-sm font-semibold text-gray-300">{attr.label}</p>
              </div>
              
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Fighter A Bar */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-3 mb-2">
                    <span className={`text-lg font-bold ${aAdvantage ? 'text-green-400' : 'text-blue-400'}`}>
                      {attr.fighterA}
                    </span>
                    <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${aAdvantage ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-1000 ease-out`}
                        style={{ width: `${(attr.fighterA / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="text-xs text-gray-600 font-mono">VS</div>

                {/* Fighter B Bar */}
                <div className="text-left">
                  <div className="flex items-center justify-start gap-3 mb-2">
                    <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${!aAdvantage ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000 ease-out`}
                        style={{ width: `${(attr.fighterB / maxValue) * 100}%` }}
                      />
                    </div>
                    <span className={`text-lg font-bold ${!aAdvantage ? 'text-green-400' : 'text-red-400'}`}>
                      {attr.fighterB}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
