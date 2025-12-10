"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Brain, BarChart3, Newspaper, GitCompare, DollarSign, Gavel, AlertTriangle, CheckCircle, Shield, Target, ChevronDown } from 'lucide-react'
import type { Agent } from "@/lib/data/mock-data"

interface AIPowerStripProps {
  agents: Agent[]
}

export function AIPowerStrip({ agents }: AIPowerStripProps) {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null)

  const agentIcons: Record<string, React.ElementType> = {
    "Tape Study": Brain,
    "Stats & Trends": BarChart3,
    "News / Weigh-ins": Newspaper,
    "Style Matchup": GitCompare,
    "Market / Odds": DollarSign,
    "Judge / Fuser": Gavel,
    "Risk / Volatility": AlertTriangle,
    "Consistency Checker": CheckCircle,
    "Referee / Second Opinion": Shield,
    "Outcome Optimizer": Target,
  }

  const getAgentDetails = (agent: Agent) => {
    const isHighConfidence = agent.probability >= 75
    
    return {
      summary: agent.notes,
      strengths: isHighConfidence 
        ? ["High confidence prediction", "Strong supporting evidence", "Aligns with other agents"]
        : ["Data-driven analysis", "Consistent methodology", "Multiple factors considered"],
      concerns: isHighConfidence
        ? ["Market pricing may reflect this edge"]
        : ["Lower confidence level", "Conflicting signals possible", "Monitor for changes"],
      factors: [
        "Historical performance data",
        "Recent form and trends",
        "Physical attributes",
        "Fighting style matchup"
      ],
      contribution: `This agent contributed ${agent.probability}% probability to the final recommendation, weighted based on its specialty relevance.`,
      verdict: isHighConfidence 
        ? `Strong ${agent.lean} signal with high conviction.`
        : `Moderate ${agent.lean} lean with cautious confidence.`
    }
  }

  return (
    <Card className="bg-linear-to-r from-[#0f1419] via-[#0b0f14] to-[#0f1419] border-foreground/10 p-6 elevation-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-linear-to-b from-purple-500 to-pink-500 rounded-full" />
          AI Agent Pipeline
        </h3>
        <p className="text-xs text-gray-400">{agents.length} Models Active</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {agents.slice(0, 8).map((agent, idx) => {
            const Icon = agentIcons[agent.name] || Brain
            const isHighConfidence = agent.probability >= 75
            const isExpanded = expandedAgent === idx
            
            return (
              <div key={idx} className="shrink-0">
                <button
                  onClick={() => setExpandedAgent(isExpanded ? null : idx)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 hover-lift ${
                    isHighConfidence 
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                      : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
                  } ${isExpanded ? 'ring-2 ring-purple-500/50' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${isHighConfidence ? 'text-green-400' : 'text-blue-400'}`} />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground foregroundspace-nowrap">{agent.name}</p>
                    <p className={`text-xs font-bold ${isHighConfidence ? 'text-green-400' : 'text-blue-400'}`}>
                      {agent.probability}%
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )
          })}
        </div>

        {expandedAgent !== null && (
          <div className="mt-4 bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-lg p-6 elevation-sm animate-in slide-in-from-top-2 duration-300">
            {(() => {
              const agent = agents[expandedAgent]
              const details = getAgentDetails(agent)
              const Icon = agentIcons[agent.name] || Brain
              const isHighConfidence = agent.probability >= 75

              return (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-foreground/10">
                    <Icon className={`w-6 h-6 ${isHighConfidence ? 'text-green-400' : 'text-blue-400'}`} />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-foreground">{agent.name}</h4>
                      <p className="text-xs text-gray-400">Agent Analysis Breakdown</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isHighConfidence 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {agent.probability}% Confidence
                    </div>
                  </div>

                  {/* Agent Insight Summary */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Agent Insight Summary</h5>
                    <p className="text-sm text-gray-400 leading-relaxed">{details.summary}</p>
                  </div>

                  {/* Two-column layout for Strengths and Concerns */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h5>
                      <ul className="space-y-1.5">
                        {details.strengths.map((strength, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Concerns
                      </h5>
                      <ul className="space-y-1.5">
                        {details.concerns.map((concern, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">•</span>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Specific Factors Analyzed */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Specific Factors Analyzed</h5>
                    <div className="flex flex-wrap gap-2">
                      {details.factors.map((factor, i) => (
                        <span 
                          key={i}
                          className="px-2.5 py-1 bg-foreground/5 border border-foreground/10 rounded text-xs text-gray-400"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Visual Metric Bar */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Confidence Level</h5>
                    <div className="relative h-2 bg-foreground/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          isHighConfidence 
                            ? 'bg-linear-to-r from-green-500 to-emerald-400'
                            : 'bg-linear-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${agent.probability}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{agent.probability}% confidence in prediction</p>
                  </div>

                  {/* Contribution Explanation */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">How It Contributed to Final Pick</h5>
                    <p className="text-xs text-gray-400 leading-relaxed">{details.contribution}</p>
                  </div>

                  {/* Agent Verdict */}
                  <div className={`p-4 rounded-lg border ${
                    isHighConfidence
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <h5 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Agent Verdict
                    </h5>
                    <p className={`text-sm font-medium ${isHighConfidence ? 'text-green-400' : 'text-blue-400'}`}>
                      {details.verdict}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </Card>
  )
}
