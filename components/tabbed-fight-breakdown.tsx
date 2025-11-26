"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Swords, Shield, Activity, Sparkles, Dumbbell } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface TabbedFightBreakdownProps {
  fight: Fight
}

interface DualMetricProps {
  label: string
  fighterA: { name: string; value: number | string }
  fighterB: { name: string; value: number | string }
  max?: number
}

function DualMetric({ label, fighterA, fighterB, max = 100 }: DualMetricProps) {
  const getPercentage = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return max === 100 ? numValue : (numValue / max) * 100
  }

  const percentA = getPercentage(fighterA.value)
  const percentB = getPercentage(fighterB.value)

  return (
    <div className="space-y-4 p-6 rounded-xl bg-linear-to-br from-gray-800/30 to-gray-900/30 border border-white/5 hover:border-white/10 transition-colors">
      <h4 className="text-base font-bold text-gray-300 text-center uppercase tracking-wide">{label}</h4>
      
      {/* Fighter A Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-blue-400">{fighterA.name}</span>
          <span className="font-bold text-white text-lg">{fighterA.value}</span>
        </div>
        <div className="h-4 bg-gray-800/70 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${percentA}%` }}
          />
        </div>
      </div>

      {/* Fighter B Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-red-400">{fighterB.name}</span>
          <span className="font-bold text-white text-lg">{fighterB.value}</span>
        </div>
        <div className="h-4 bg-gray-800/70 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-linear-to-r from-red-600 via-red-500 to-red-400 transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${percentB}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function TabbedFightBreakdown({ fight }: TabbedFightBreakdownProps) {
  const [fighterAName, fighterBName] = fight.matchup.split(' vs. ')

  const categories = [
    {
      id: "striking",
      label: "Striking",
      icon: Swords,
      metrics: [
        { 
          label: "Significant Strikes / Min", 
          fighterA: { name: fighterAName, value: 5.2 },
          fighterB: { name: fighterBName, value: 3.8 },
          max: 7
        },
        { 
          label: "Striking Accuracy", 
          fighterA: { name: fighterAName, value: 52 },
          fighterB: { name: fighterBName, value: 44 },
          max: 100
        },
        { 
          label: "Striking Defense", 
          fighterA: { name: fighterAName, value: 62 },
          fighterB: { name: fighterBName, value: 52 },
          max: 100
        },
        { 
          label: "Head Strike %", 
          fighterA: { name: fighterAName, value: 48 },
          fighterB: { name: fighterBName, value: 40 },
          max: 100
        },
        { 
          label: "Knockdowns / 15 min", 
          fighterA: { name: fighterAName, value: 1.5 },
          fighterB: { name: fighterBName, value: 0.3 },
          max: 2
        },
        { 
          label: "Power Differential", 
          fighterA: { name: fighterAName, value: 82 },
          fighterB: { name: fighterBName, value: 65 },
          max: 100
        },
      ]
    },
    {
      id: "grappling",
      label: "Grappling",
      icon: Shield,
      metrics: [
        { 
          label: "Takedown Defense", 
          fighterA: { name: fighterAName, value: 82 },
          fighterB: { name: fighterBName, value: 68 },
          max: 100
        },
        { 
          label: "Control Time (min:sec)", 
          fighterA: { name: fighterAName, value: "2:45" },
          fighterB: { name: fighterBName, value: "1:12" },
          max: 5
        },
        { 
          label: "Submission Attempts / 15m", 
          fighterA: { name: fighterAName, value: 0.8 },
          fighterB: { name: fighterBName, value: 1.2 },
          max: 2
        },
        { 
          label: "Reversal Rate", 
          fighterA: { name: fighterAName, value: 68 },
          fighterB: { name: fighterBName, value: 45 },
          max: 100
        },
      ]
    },
    {
      id: "pace",
      label: "Pace & Cardio",
      icon: Activity,
      metrics: [
        { 
          label: "Tempo", 
          fighterA: { name: fighterAName, value: 75 },
          fighterB: { name: fighterBName, value: 62 },
          max: 100
        },
        { 
          label: "Pressure", 
          fighterA: { name: fighterAName, value: 82 },
          fighterB: { name: fighterBName, value: 58 },
          max: 100
        },
        { 
          label: "Gas Tank", 
          fighterA: { name: fighterAName, value: 88 },
          fighterB: { name: fighterBName, value: 72 },
          max: 100
        },
        { 
          label: "Strike Volume Stability", 
          fighterA: { name: fighterAName, value: 78 },
          fighterB: { name: fighterBName, value: 65 },
          max: 100
        },
      ]
    },
    {
      id: "style",
      label: "Style Matchup",
      icon: Sparkles,
      metrics: [
        { 
          label: "Range Advantage", 
          fighterA: { name: fighterAName, value: 72 },
          fighterB: { name: fighterBName, value: 55 },
          max: 100
        },
        { 
          label: "Footwork Rating", 
          fighterA: { name: fighterAName, value: 85 },
          fighterB: { name: fighterBName, value: 68 },
          max: 100
        },
        { 
          label: "Stance Advantage", 
          fighterA: { name: fighterAName, value: 65 },
          fighterB: { name: fighterBName, value: 70 },
          max: 100
        },
        { 
          label: "Kick Frequency", 
          fighterA: { name: fighterAName, value: 78 },
          fighterB: { name: fighterBName, value: 45 },
          max: 100
        },
      ]
    },
    {
      id: "camp",
      label: "Camp / Prep",
      icon: Dumbbell,
      metrics: [
        { 
          label: "Camp Quality", 
          fighterA: { name: fighterAName, value: 88 },
          fighterB: { name: fighterBName, value: 75 },
          max: 100
        },
        { 
          label: "Sparring Partners", 
          fighterA: { name: fighterAName, value: 82 },
          fighterB: { name: fighterBName, value: 78 },
          max: 100
        },
        { 
          label: "Injury Risk", 
          fighterA: { name: fighterAName, value: 25 },
          fighterB: { name: fighterBName, value: 45 },
          max: 100
        },
        { 
          label: "Weight Cut Difficulty", 
          fighterA: { name: fighterAName, value: 30 },
          fighterB: { name: fighterBName, value: 55 },
          max: 100
        },
      ]
    },
  ]

  return (
    <Card className="p-10 bg-linear-to-br from-[#0f1419] to-[#0b0f14] border-2 border-white/10 shadow-2xl shadow-black/50 rounded-2xl">
      <h2 className="text-3xl font-bold text-white mb-3 flex items-center gap-4">
        <div className="w-1.5 h-10 bg-linear-to-b from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/50" />
        Full Fight Breakdown
      </h2>
      <p className="text-base text-gray-400 mb-10 ml-9">
        <span className="text-blue-400 font-semibold">Blue</span> = {fighterAName} • <span className="text-red-400 font-semibold">Red</span> = {fighterBName}
      </p>

      <Tabs defaultValue="striking" className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-3 bg-transparent p-0 mb-10">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 px-6 py-4 bg-gray-800/50 hover:bg-gray-800 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 border-2 border-white/10 data-[state=active]:border-blue-500/50 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{category.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {category.metrics.map((metric, idx) => (
              <DualMetric
                key={idx}
                label={metric.label}
                fighterA={metric.fighterA}
                fighterB={metric.fighterB}
                max={metric.max}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  )
}
