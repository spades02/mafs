'use server'

import { db } from "@/db/client"
import { events } from "@/db/schema/events-schema"
import { fights } from "@/db/schema/fights-schema"
import { gt, asc, eq, sql } from "drizzle-orm"

export async function getFutureEvents() {
    try {
        const now = new Date()

        // Fetch future events sorted by date with fight count
        const futureEvents = await db.select({
            eventId: events.eventId,
            name: events.name,
            dateTime: events.dateTime,
            venue: events.venue,
            createdAt: events.createdAt,
            updatedAt: events.updatedAt,
            fightCount: sql<number>`count(${fights.id})`.mapWith(Number)
        })
            .from(events)
            .leftJoin(fights, eq(events.eventId, fights.eventId))
            .where(gt(events.dateTime, now))
            .groupBy(events.eventId, events.name, events.dateTime, events.venue, events.createdAt, events.updatedAt)
            .orderBy(asc(events.dateTime))

        return futureEvents.map(event => ({
            ...event,
            dateTime: event.dateTime ? event.dateTime.toISOString() : null,
            createdAt: event.createdAt ? event.createdAt.toISOString() : null,
            updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
            fightCount: event.fightCount || 0
        }))
    } catch (error) {
        console.error("Failed to fetch future events:", error)
        return []
    }
}

import { fighters } from "@/db/schema/fighters-schema"
import { alias } from "drizzle-orm/pg-core"

export async function getEventFights(eventId: string) {
    try {
        const fighter1 = alias(fighters, "fighter1")
        const fighter2 = alias(fighters, "fighter2")

        const eventFights = await db.select({
            fight: fights,
            f1: fighter1,
            f2: fighter2,
        })
            .from(fights)
            .leftJoin(fighter1, eq(fights.fighterAId, fighter1.id))
            .leftJoin(fighter2, eq(fights.fighterBId, fighter2.id))
            .where(eq(fights.eventId, eventId))
        // .orderBy(asc(fights.order)) // Order column removed

        return eventFights.map(({ fight, f1, f2 }) => ({
            ...fight,
            fightId: fight.id, // Normalized to fightId for frontend compatibility
            eventId: fight.eventId,
            // createdAt: fight.createdAt.toISOString(), // Removed
            // updatedAt: fight.updatedAt.toISOString(), // Removed
            fighter1: f1 ? {
                id: f1.id,
                firstName: f1.firstName,
                lastName: f1.lastName,
                nickname: f1.nickname,
            } : null,
            fighter2: f2 ? {
                id: f2.id,
                firstName: f2.firstName,
                lastName: f2.lastName,
                nickname: f2.nickname,
            } : null,
        }))
    } catch (error) {
        console.error(`Failed to fetch fights for event ${eventId}:`, error)
        return []
    }
}
