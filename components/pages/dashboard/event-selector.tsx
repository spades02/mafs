"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"
import { EventData } from "@/app/(app)/dashboard/d-types"

export interface EventSelectorProps {
    selectedEventId: string
    onSelectEvent: (value: string) => void
    isScanning: boolean
    scanComplete: boolean
    onRunSimulation: () => void
    events: Array<{ eventId: string; name: string; dateTime: string | null; venue: string | null; fightCount?: number }>
}

export function EventSelector({
    selectedEventId,
    onSelectEvent,
    isScanning,
    scanComplete,
    onRunSimulation,
    events,
}: EventSelectorProps) {
    const currentEvent = events.find(e => e.eventId === selectedEventId)

    // We don't have location/fights in the basic DB event schema yet
    // Placeholder logic for future expansion
    const formattedDate = currentEvent?.dateTime ? new Date(currentEvent.dateTime).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : "Date TBD"

    return (
        <div className="event-selector-card glass-panel max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">Select Event</label>
                    <Select value={selectedEventId} onValueChange={onSelectEvent}>
                        <SelectTrigger className="w-full glass-input h-14 text-base">
                            <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0b0f14] border-white/10 text-white">
                            {events.map((event) => (
                                <SelectItem key={event.eventId} value={event.eventId} className="text-gray-200 focus:bg-white/10 focus:text-white cursor-pointer">
                                    {event.name} — {event.dateTime ? new Date(event.dateTime).toLocaleDateString() : 'TBD'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {currentEvent?.venue || "Location TBD"}
                        </p>
                        {currentEvent?.fightCount ? <span className="text-xs text-muted-foreground/60">{currentEvent.fightCount} Fights on card</span> : null}
                    </div>

                    <Button
                        onClick={onRunSimulation}
                        disabled={isScanning || !selectedEventId}
                        className={`premium-button min-w-[220px] h-14 text-base font-semibold ${scanComplete ? "scan-complete" : ""}`}
                    >
                        {isScanning ? (
                            <span className="flex items-center gap-3">
                                <div className="relative w-5 h-5">
                                    <div className="absolute inset-0 rounded-full border-2 border-current/20" />
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin" />
                                </div>
                                <span>Running Simulation...</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                <span>Run AI Simulation</span>
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
