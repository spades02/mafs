"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronRight } from 'lucide-react'

function EventsList() {
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const events = [
    {
      id: "ufc-300",
      name: "UFC 300",
      date: "April 13, 2024",
      record: "8-2",
      profit: "+10.5u",
      roi: "+42.8%",
      hitRate: "80%",
      plays: [
        { fight: "Strickland vs Adesanya", bet: "Strickland ML +500", stake: "2.5u", result: "+12.5u" },
        { fight: "Pantoja vs Erceg", bet: "Pantoja ITD -150", stake: "3.0u", result: "+2.0u" },
      ],
    },
    {
      id: "ufc-301",
      name: "UFC 301",
      date: "May 4, 2024",
      record: "6-3",
      profit: "+5.2u",
      roi: "+28.9%",
      hitRate: "66.7%",
      plays: [{ fight: "Holloway vs Gaethje", bet: "Holloway ML +180", stake: "2.0u", result: "+3.6u" }],
    },
    {
      id: "ufc-302",
      name: "UFC 302",
      date: "June 1, 2024",
      record: "7-2",
      profit: "+8.3u",
      roi: "+38.2%",
      hitRate: "77.8%",
      plays: [{ fight: "Makhachev vs Poirier", bet: "Over 2.5 Rounds +120", stake: "2.0u", result: "+2.4u" }],
    },
  ]

  return (
    <Card>
          <CardHeader>
            <CardTitle>Event Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg border border-border">
                  <button
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      {expandedEvent === event.id ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-semibold">{event.name}</div>
                        <div className="text-sm text-muted-foreground">{event.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Record</div>
                        <div className="font-semibold">{event.record}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Profit</div>
                        <div className="font-bold text-primary">{event.profit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">ROI</div>
                        <div className="font-semibold">{event.roi}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Hit Rate</div>
                        <div className="font-semibold">{event.hitRate}</div>
                      </div>
                    </div>
                  </button>
                  {expandedEvent === event.id && (
                    <div className="border-t border-border bg-muted/30 p-4">
                      <div className="space-y-2">
                        {event.plays.map((play, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg bg-card p-3 text-sm">
                            <span className="font-medium">{play.fight}</span>
                            <span className="text-muted-foreground">{play.bet}</span>
                            <span className="font-semibold">{play.stake}</span>
                            <span className="font-bold text-green-400">{play.result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
  )
}

export default EventsList