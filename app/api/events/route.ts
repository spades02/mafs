import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { gte } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch only future events from database, ordered by date
    const now = new Date();
    const cachedEvents = await db
      .select({
        EventId: events.eventId, // Will need serialization
        Name: events.name,
      })
      .from(events)
      .where(gte(events.dateTime, now))
      .orderBy(events.dateTime);

    // Convert BigInts to strings
    const serializedEvents = cachedEvents.map(e => ({
      ...e,
      EventId: e.EventId.toString()
    }));

    return NextResponse.json(serializedEvents);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}
