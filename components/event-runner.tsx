"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { EventData } from '@/types/event'
import { FightEdgeSummary } from './analysis-section'
import { FightBreakdownType } from '@/types/fight-breakdowns'

type EventItem = {
  EventId: number;
  Name: string;
};

function EventRunner({
  setShowResults,
  setFightData,
  setFightBreakdowns
}: {
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  setFightData: React.Dispatch<React.SetStateAction<FightEdgeSummary[]>>;
  setFightBreakdowns: React.Dispatch<React.SetStateAction<FightBreakdownType[]>>;
}){
const [selectedEvent, setSelectedEvent] = useState("")
const [events, setEvents] = useState<EventItem[]>([]);
const [loading, setLoading] = useState(true);
const [ error, setError ] = useState("")

async function callAgent(data: EventData){
  try {
    const res = await fetch("api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if(!res.ok){
      throw new Error("Failed to analyze card")
    }
    const result = await res.json()
    setFightData(result.mafsCoreEngine);
    setFightBreakdowns(result.fightBreakdowns)

  } catch (error) {
    console.error(error)
  }
}
async function runAnalysis() {
  setShowResults(true)
  try {
    const res = await fetch(`/api/fights/${selectedEvent}`);

    if(!res.ok) {
      throw new Error("Failed to fetch fights");
    }

    const data = await res.json();
    
    callAgent(data);

  } catch (error) {
    console.error(error)
  }
}

useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");

        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await res.json();

        const formatted: EventItem[] = data.map((e: any) => ({
          EventId: e.EventId,
          Name: e.Name,
        }));

        setEvents(formatted);
      } catch (err: any) {
        setError(err.message || "Error fetching events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 sm:w-[300px]">
                  {/* if API tokens are not limited then fetch fights right here onValueChange for quick response */}
                <Select value={selectedEvent} onValueChange={setSelectedEvent}> 
                  <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder={loading ? "Loading..." : "Choose UFC event…"} />
                  </SelectTrigger>
                  
                  <SelectContent>
                    {error && (
                     <div className="text-red-500 px-3 py-2 text-sm">
                       {error}
                     </div>
                    )}
                    {!error &&
            events.map((event) => (
              <SelectItem key={event.EventId} value={String(event.EventId)}>
                {event.Name}
              </SelectItem>
            ))}
                    </SelectContent>
                </Select>
              </div>
              <Button
                onClick={runAnalysis}
                disabled={!selectedEvent}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Run Full Card (All Fights)
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              MAFS will scan all available markets and rank the best edges.
            </p>
          </CardContent>
        </Card>
  )
}

export default EventRunner