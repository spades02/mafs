import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import MarketEdgeSkeleton from './market-edge-skeleton'
import { FightEdgeSummary } from '@/types/fight-edge-summary'

interface AllMarketEdgesProps {
  fightData: FightEdgeSummary[];
  isLoading?: boolean;
  isComplete?: boolean;
}

function AllMarketEdges({ fightData, isLoading = false, isComplete = false }: AllMarketEdgesProps) {
  const hasData = fightData && fightData.length > 0;
  const showSkeletons = !hasData || (isLoading && !isComplete);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Market Edges Found</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Moneyline</h4>
            <div className="space-y-2">
              {fightData
                .filter((item) => item.ev !== 0)
                .map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="font-medium">{item.bet}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">{item.ev}%</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
                {showSkeletons && <MarketEdgeSkeleton />}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Method of Victory</h4>
            <div className="space-y-2">
              {fightData
                .filter((item) => item.ev !== 0)
                .map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="font-medium">{item.bet}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">{item.ev}%</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
                {showSkeletons && <MarketEdgeSkeleton />}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Over/Under</h4>
            <div className="space-y-2">
              {fightData
                .filter((item) => item.ev !== 0)
                .map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="font-medium">{item.bet}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">{item.ev}%</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
                {showSkeletons && <MarketEdgeSkeleton />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AllMarketEdges