import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FightEdgeSummary } from '@/lib/agents/output-schemas'
import { Skeleton } from './ui/skeleton'
import MarketEdgeSkeleton from './market-edge-skeleton'

function AllMarketEdges({fightData}:{fightData: FightEdgeSummary[]}) {
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
                    {(!fightData || fightData.length === 0) && (
                      <>
                        <MarketEdgeSkeleton/>
                      </>
                    )}
                      {fightData
                      .filter((item) => item.ev !== "0" && item.ev !== "0%")
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                          <span className="font-medium">{item.bet}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">{item.truth}</span>
                            <span className="font-bold text-primary">{item.ev}</span>
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                              {item.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Method of Victory</h4>
                    <div className="space-y-2">
                    {(!fightData || fightData.length === 0) && (
                      <>
                        <MarketEdgeSkeleton/>
                      </>
                    )}
                      {fightData
                      .filter((item) => item.ev !== "0" && item.ev !== "0%")
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                          <span className="font-medium">{item.bet}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">{item.truth}</span>
                            <span className="font-bold text-primary">{item.ev}</span>
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                              {item.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Over/Under</h4>
                    <div className="space-y-2">
                    {(!fightData || fightData.length === 0) && (
                      <>
                        <MarketEdgeSkeleton/>
                      </>
                    )}
                      {fightData
                      .filter((item)=> item.ev !=="0" && item.ev !== "0%")
                      .map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                          <span className="font-medium">{item.bet}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">{item.truth}</span>
                            <span className="font-bold text-primary">{item.ev}</span>
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                              {item.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
  )
}

export default AllMarketEdges