import { Card } from "@/components/ui/card"
import { FileText } from 'lucide-react'
import type { Fight } from "@/lib/data/mock-data"

interface ExecutiveSummaryProps {
  fight: Fight
}

export function ExecutiveSummary({ fight }: ExecutiveSummaryProps) {
  const generateSummary = () => {
    if (fight.no_bet) {
      return `Pass on this fight due to ${fight.no_bet_reasons[0]?.toLowerCase() || 'conflicting signals'}. ${fight.volatility} volatility with no clear edge detected.`
    }

    const topProp = fight.prop_predictions[0]
    const summary = `${fight.pick} wins via ${fight.path} with ${fight.confidence}% confidence. Best prop: ${topProp?.prop} (${topProp?.confidence}% confidence) due to ${topProp?.reason.toLowerCase()}. Risk level: ${fight.volatility}.`
    
    return summary
  }

  return (
    <Card className="bg-linear-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30 p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-bold text-indigo-400">Executive Summary</h3>
          <p className="text-base leading-relaxed text-gray-300">
            {generateSummary()}
          </p>
        </div>
      </div>
    </Card>
  )
}
