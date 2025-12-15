import React from 'react'
import { Card, CardContent } from './ui/card'
import { FightEdgeSummary } from './pages/home/analysis-section'
import { Skeleton } from './ui/skeleton'

function BestBets({fightData}: {fightData: FightEdgeSummary[]}) {
  return (
    <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Best Bets on This Card</h2>
              <div className="grid gap-4 md:grid-cols-3">
              {(!fightData || fightData.length === 0) && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </>
        )}
                {fightData
                  .filter((bet) => bet.ev !== "0" && bet.ev !== "0%")
                  .map((bet, index) => (
                    <Card key={index} className="card-glow">
                      <CardContent className="p-6">
                        <div className="mb-2 text-xs font-semibold text-primary">{bet.rank}</div>
                        <div className="mb-3 text-lg font-bold">{bet.bet}</div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{bet.ev} EV</span>
                          <span className="text-sm text-muted-foreground">{bet.confidence} confidence</span>
                        </div>
                        <div className="inline-flex rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                          {bet.tier}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            </div>
  )
}

export default BestBets