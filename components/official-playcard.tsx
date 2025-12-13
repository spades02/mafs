"use client"

import { Fight } from "@/lib/data/mock-data"
import { TrendingUp, Activity, Shield, Zap, Target, AlertTriangle } from 'lucide-react'

interface OfficialPlayCardProps {
  fight: Fight
}

export function OfficialPlayCard({ fight }: OfficialPlayCardProps) {
  if (fight.no_bet) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/30 bg-linear-to-br from-[#1a0f0f] to-[#0f1419] p-6 elevation-lg">
        <div className="absolute inset-0 bg-linear-to-r from-red-500/5 to-transparent" />
        <div className="relative z-10 text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500 animate-glow-pulse-red" />
          </div>
          <h2 className="text-3xl font-bold text-red-500 mb-3">NO BET RECOMMENDED</h2>
          <p className="text-xl text-gray-300 mb-4">{fight.matchup}</p>
          <div className="space-y-2">
            {fight.no_bet_reasons.map((reason, idx) => (
              <p key={idx} className="text-gray-400">• {reason}</p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const bestOutcome = fight.best_outcomes[0]
  const bestProp = fight.prop_predictions[0]

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-green-500/30 bg-linear-to-br from-[#0f1a0f] via-[#0f1419] to-[#0f1419] p-2.5 elevation-lg animate-glow-pulse-green">
      <div className="absolute inset-0 bg-linear-to-r from-green-500/10 via-blue-500/5 to-purple-500/5 animate-hero-gradient opacity-50" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="inline-block px-3 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 mb-1.5">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Official AI Play</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{fight.matchup}</h1>
        </div>

        {/* Main Pick */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          <div className="col-span-1 md:col-span-3 text-center py-2 rounded-xl bg-linear-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
            <p className="text-xs text-gray-400 mb-1">THE PICK</p>
            <p className="text-4xl font-bold text-green-400 mb-1">{fight.pick}</p>
            <p className="text-base text-gray-300">via {fight.path}</p>
          </div>

          <div className="text-center p-2 rounded-xl bg-[#0f1419]/50 border border-foreground/10 hover-glow">
            <div className="flex justify-center mb-1">
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">CONFIDENCE</p>
            <p className="text-2xl font-bold text-foreground">{fight.confidence}%</p>
          </div>

          <div className="text-center p-2 rounded-xl bg-[#0f1419]/50 border border-foreground/10 hover-glow">
            <div className="flex justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">MODEL EDGE</p>
            <p className="text-2xl font-bold text-green-400">+{bestOutcome?.edge_pts || 0}</p>
          </div>

          <div className="text-center p-2 rounded-xl bg-[#0f1419]/50 border border-foreground/10 hover-glow">
            <div className="flex justify-center mb-1">
              <Zap className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">EXPECTED VALUE</p>
            <p className="text-2xl font-bold text-yellow-400">{bestOutcome?.ev_percent || 0}%</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-center p-1.5 rounded-lg bg-[#0f1419]/30 border border-foreground/5 hover-glow">
            <p className="text-xs text-gray-400 mb-0.5">RISK LEVEL</p>
            <p className={`text-base font-bold ${
              fight.volatility === "Low" ? "text-green-400" : 
              fight.volatility === "Medium" ? "text-yellow-400" : "text-red-400"
            }`}>{fight.volatility}</p>
          </div>

          <div className="text-center p-1.5 rounded-lg bg-[#0f1419]/30 border border-foreground/5 hover-glow">
            <p className="text-xs text-gray-400 mb-0.5">VOLATILITY</p>
            <p className="text-base font-bold text-foreground">{fight.volatility}</p>
          </div>

          <div className="text-center p-1.5 rounded-lg bg-[#0f1419]/30 border border-foreground/5 hover-glow">
            <p className="text-xs text-gray-400 mb-0.5">BEST PROP</p>
            <p className="text-sm font-bold text-blue-400">{bestProp?.prop || "N/A"}</p>
          </div>

          <div className="text-center p-1.5 rounded-lg bg-[#0f1419]/30 border border-foreground/5 hover-glow">
            <p className="text-xs text-gray-400 mb-0.5">SMART ANGLE</p>
            <p className="text-sm font-bold text-purple-400">{fight.alt_lean || "Standard"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
