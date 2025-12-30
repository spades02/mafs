"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { EventData } from "@/types/event";
import { FightEdgeSummary } from "@/types/fight-edge-summary";
import { FightBreakdownType } from "@/types/fight-breakdowns";
import AnalysisButton from "./analysis-button";

type EventItem = {
  EventId: number;
  Name: string;
};

function normalizeBreakdowns(raw: any): Record<number, FightBreakdownType> {
  const out: Record<number, FightBreakdownType> = {};

  if (!raw) return out;

  // If agent returned an array
  if (Array.isArray(raw)) {
    raw.forEach((b: any) => {
      if (b && (b.id !== undefined && b.id !== null)) {
        out[Number(b.id)] = b as FightBreakdownType;
      }
    });
    return out;
  }

  // If agent returned an object / record { "10215": {...}, ... }
  if (typeof raw === "object") {
    Object.entries(raw).forEach(([k, v]) => {
      const n = Number(k);
      if (!Number.isNaN(n) && v) {
        out[n] = v as FightBreakdownType;
      }
    });
    return out;
  }

  return out;
}

function EventRunner({
  setShowResults,
  setFightData,
  setFightBreakdowns,
}: {
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  setFightData: React.Dispatch<React.SetStateAction<FightEdgeSummary[]>>;
  setFightBreakdowns: React.Dispatch<React.SetStateAction<Record<number, FightBreakdownType>>>;
}) {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
  
    fetchUser();
  }, []);
  

  async function callAgent(data: EventData) {
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error("Failed to analyze card");

      const result = await res.json();

      // mafsCoreEngine is expected to be an array
      setFightData(result.mafsCoreEngine ?? []);

      // normalize fightBreakdowns to Record<number, FightBreakdownType>
      const normalized = normalizeBreakdowns(result.fightBreakdowns);
      setFightBreakdowns(normalized);
    } catch (err) {
      console.error(err);
      setError((err as any)?.message ?? "Agent error");
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    setLoading(true);
    setShowResults(true);
    try {
      const res = await fetch(`/api/fights/${selectedEvent}`);
      if (!res.ok) throw new Error("Failed to fetch fights");
      const data = await res.json();

      await callAgent(data);
    } catch (err) {
      console.error(err);
      setError((err as any)?.message ?? "Error running analysis");
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        const formatted: EventItem[] = data.map((e: any) => ({
          EventId: e.EventId,
          Name: e.Name,
        }));
        setEvents(formatted);
      } catch (err: any) {
        setError(err.message || "Error fetching events");
      }
    }
    fetchEvents();
  }, []);

  return (
    <Card className="mb-8 bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 sm:w-[300px]">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder={loading ? "Loading..." : "Choose UFC event…"} />
              </SelectTrigger>

              <SelectContent>
                {error && <div className="text-red-500 px-3 py-2 text-sm">{error}</div>}
                {!error &&
                  events.map((event) => (
                    <SelectItem key={event.EventId} value={String(event.EventId)}>
                      {event.Name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <AnalysisButton
  user={user}
  authLoading={authLoading}
  selectedEvent={!!selectedEvent}
  loading={loading}
  onRunAnalysis={runAnalysis}
  maxFreeAnalyses={3} // Optional, defaults to 3
/>

        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          MAFS will scan all available markets and rank the best edges.
        </p>

        {loading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-primary animate-fade-in">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>AI is scanning mispriced lines…</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EventRunner;
