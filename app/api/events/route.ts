import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";

export async function GET() {
  try {
    // Fetch events from database, ordered by date
    const cachedEvents = await db
      .select({
        EventId: events.eventId,
        Name: events.name,
      })
      .from(events)
      .orderBy(events.dateTime);

    return NextResponse.json(cachedEvents);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}
