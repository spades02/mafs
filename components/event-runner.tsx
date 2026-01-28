"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import AnalysisButton from "./analysis-button";

import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface EventRunnerProps {
  setShowResults: (show: boolean) => void;
  startAnalysis: (eventData: any) => Promise<void>;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  reset: () => void;
}

type EventItem = {
  EventId: number;
  Name: string;
};

function EventRunner({
  setShowResults,
  startAnalysis,
  isLoading,
  isComplete,
  error,
  reset,
}: EventRunnerProps) {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  useEffect(() => {
    fetchUser();
  }, []);

  async function runAnalysis() {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    reset(); // Clear previous results
    setShowResults(true);

    try {
      const res = await fetch(`/api/fights/${selectedEvent}`);
      if (!res.ok) throw new Error("Failed to fetch fights");
      const data = await res.json();

      await startAnalysis(data);
    } catch (err) {
      console.error(err);
      setFetchError((err as any)?.message ?? "Error running analysis");
    } finally {
      await fetchUser();
    }
  }

  async function fetchEvents() {
    setIsLoadingEvents(true);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      const formatted: EventItem[] = data.map((e: any) => ({
        EventId: e.EventId,
        Name: e.Name,
      }));
      setEvents(formatted);
      setFetchError("");
    } catch (err: any) {
      setFetchError(err.message || "Error fetching events");
    } finally {
      setIsLoadingEvents(false);
    }
  }

  async function refreshEvents() {
    setIsRefreshing(true);
    setFetchError("");

    try {
      const res = await fetch("/api/events/refresh", { method: "POST" });
      if (!res.ok) throw new Error("Failed to refresh events");

      // Re-fetch events from database after refresh
      await fetchEvents();
    } catch (err: any) {
      setFetchError(err.message || "Error refreshing events");
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleEventChange(value: string) {
    if (value === "__refresh__") {
      refreshEvents();
    } else {
      setSelectedEvent(value);
      reset(); // Clear results immediately when event changes
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Card className="mb-8 bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 sm:w-[300px]">
            <Select value={selectedEvent} onValueChange={handleEventChange}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder={isRefreshing ? "Refreshing..." : "Choose UFC event…"} />
              </SelectTrigger>

              <SelectContent>
                {fetchError && <div className="text-red-500 px-3 py-2 text-sm">{fetchError}</div>}

                {/* Loading spinner */}
                {isLoadingEvents && !fetchError && (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading events...</span>
                  </div>
                )}

                {!isLoadingEvents && !fetchError &&
                  events.map((event) => (
                    <SelectItem key={event.EventId} value={String(event.EventId)}>
                      {event.Name}
                    </SelectItem>
                  ))}

                {/* Refresh Events Option */}
                <div className="border-t border-border mt-1 pt-1">
                  <SelectItem
                    value="__refresh__"
                    className="text-muted-foreground hover:text-primary cursor-pointer"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? "⏳ Refreshing..." : "🔄 Refresh Events List"}
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>

          <AnalysisButton
            user={user}
            authLoading={authLoading}
            selectedEvent={!!selectedEvent}
            loading={isLoading}
            onRunAnalysis={runAnalysis}
            maxFreeAnalyses={3}
          />
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          MAFS will scan all available markets and rank the best edges.
        </p>

        {/* Show streaming error */}
        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            ⚠️ {error}
          </div>
        )}

        {/* Show loading state */}
        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-primary animate-fade-in">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>AI is scanning mispriced lines…</span>
          </div>
        )}

        {/* Show completion state */}
        {isComplete && (
          <div className="mt-4 flex items-center gap-2 text-sm text-primary">
            <span>✅ Analysis complete!</span>
            <span>AI can make mistakes. Place your bets responsibly.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EventRunner;
