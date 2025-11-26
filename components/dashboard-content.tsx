import { Activity, BarChart3, Brain, Shield, Target, TrendingUp } from 'lucide-react'
import React from 'react'
import { OfficialPlayCard } from './official-playcard'
import { ExecutiveSummary } from './executive-summary'
import { CollapsibleSection } from './collapsible-section'
import { ModernFighterComparison } from './modern-fighter-comparison'
import { BettingSlipProps } from './betting-slip-props'
import { AIPowerStrip } from './ai-power-strip'
import { EnhancedPropEVGrid } from './enhanced-prop-ev-grid'
import { EnhancedRiskVolatility } from './enhanced-risk-volatility'
import { TabbedFightBreakdown } from './tabbed-fight-breakdown'
import { BettingRecommendationCard } from './betting-recommendation-card'
import { Fight } from '@/lib/data/mock-data'
import { RedFlagAlert } from './red-flag-alert'
import { JsonOutputPanel } from './json-output-panel'

export function DashboardContent({selectedFight} : {selectedFight: Fight}){
  return (
        <div className="space-y-7 animate-fade-in">
          <div>
            <div className="section-chip mb-5">
              <Target className="h-3 w-3" />
              Official AI Pick
            </div>
            <OfficialPlayCard fight={selectedFight} />
          </div>
          <div className="divider-green-blue" />

          <div>
            <div className="section-chip mb-5">
              <Brain className="h-3 w-3" />
              Executive Summary
            </div>
            <ExecutiveSummary fight={selectedFight} />
          </div>

          {selectedFight.risk_flags.length > 0 && (
            <>
              <div className="divider-neutral" />
              <div>
                <div className="section-chip mb-5">
                  <Shield className="h-3 w-3" />
                  Risk Warnings
                </div>
                <RedFlagAlert fight={selectedFight} />
              </div>
            </>
          )}

          <div className="divider-blue-purple" />

          <div>
            <div className="section-chip mb-5">
              <BarChart3 className="h-3 w-3" />
              Fighter Stats
            </div>
            <CollapsibleSection
              title="Skill Comparison"
              subtitle="Side-by-side comparison of both fighters' attributes"
              icon={<BarChart3 className="h-5 w-5" />}
            >
              <ModernFighterComparison fight={selectedFight} />
            </CollapsibleSection>
          </div>

          <div className="divider-neutral" />

          <div>
            <div className="section-chip mb-5">
              <Target className="h-3 w-3" />
              Best Betting Opportunities
            </div>
            <CollapsibleSection
              title="Top 3 Props"
              subtitle="Highest expected value bets recommended by the AI"
              icon={<Target className="h-5 w-5" />}
            >
              <BettingSlipProps fight={selectedFight} />
            </CollapsibleSection>
          </div>

          <div className="divider-neutral" />

          <CollapsibleSection
            title="AI Agent Pipeline"
            subtitle="8 specialized agents analyzing different aspects of the fight"
            icon={<Brain className="h-5 w-5" />}
          >
            <AIPowerStrip agents={selectedFight.__agents__} />
          </CollapsibleSection>

          <div className="divider-neutral" />

          <CollapsibleSection
            title="Full Prop EV Analysis"
            subtitle="Expected value vs market odds for all bet types"
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <EnhancedPropEVGrid fight={selectedFight} />
          </CollapsibleSection>

          <div className="divider-purple-red" />

          <CollapsibleSection
            title="Risk & Volatility Analysis"
            subtitle="Probability breakdown of how the fight ends"
            icon={<Shield className="h-5 w-5" />}
          >
            <EnhancedRiskVolatility fight={selectedFight} />
          </CollapsibleSection>

          <div className="divider-neutral" />

          <div>
            <div className="section-chip mb-5">
              <Activity className="h-3 w-3" />
              Fight Simulation
            </div>
            <CollapsibleSection
              title="Full Fight Breakdown"
              subtitle="Round-by-round statistical analysis and predictions"
              icon={<Activity className="h-5 w-5" />}
            >
              <TabbedFightBreakdown fight={selectedFight} />
            </CollapsibleSection>
          </div>

          <div className="divider-green-blue" />

          <CollapsibleSection
            title="Final Betting Recommendation"
            subtitle="The AI's complete betting strategy for this fight"
            icon={<Target className="h-5 w-5" />}
            defaultOpen
          >
            <BettingRecommendationCard fight={selectedFight} />
          </CollapsibleSection>

          <div className="divider-neutral" />

          <JsonOutputPanel fight={selectedFight} />
        </div>  )
}

export default DashboardContent