import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";

export async function POST() {
    const apiKey = process.env.SPORTS_DATA_API_KEY;

    try {
        // Fetch events from SportsData API
        const res = await fetch(
            `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/2026?key=${apiKey}`
        );

        if (!res.ok) {
            throw new Error("Failed to fetch events from SportsData API");
        }

        const data = await res.json();

        // Upsert events into the database
        for (const event of data) {
            await db
                .insert(events)
                .values({
                    eventId: event.EventId,
                    name: event.Name,
                    dateTime: event.DateTime ? new Date(event.DateTime) : null,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: events.eventId,
                    set: {
                        name: event.Name,
                        dateTime: event.DateTime ? new Date(event.DateTime) : null,
                        updatedAt: new Date(),
                    },
                });
        }

        return NextResponse.json({ success: true, count: data.length });
    } catch (error: any) {
        console.error("Error refreshing events:", error);
        return NextResponse.json(
            { error: error.message || "Failed to refresh events" },
            { status: 500 }
        );
    }
}
