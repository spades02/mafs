'use server'

import { db } from "@/db/client"
import { events } from "@/db/schema/events-schema"
import { fights } from "@/db/schema/fights-schema"
import { historicalOdds } from "@/db/schema/historical-odds-schema"
import { gt, asc, eq, and, sql } from "drizzle-orm"

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
            .where(gt(events.dateTime, new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)))
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

export async function getFightOddsHistory(fightId: string, fighterId: string) {
    try {
        const history = await db.select({
            timestamp: historicalOdds.timestamp,
            moneyline: historicalOdds.moneyline
        })
            .from(historicalOdds)
            .where(
                and(
                    eq(historicalOdds.fightId, fightId),
                    eq(historicalOdds.fighterId, fighterId)
                )
            )
            .orderBy(asc(historicalOdds.timestamp));

        // Return a condensed, ordered subset of points to avoid sending thousands of rows
        // For line charts we only need max ~50 points
        const step = Math.max(1, Math.floor(history.length / 50));
        const chartData = [];

        for (let i = 0; i < history.length; i += step) {
            chartData.push({
                timestamp: history[i].timestamp?.toISOString() ?? new Date().toISOString(),
                oddsAmerican: history[i].moneyline || 0
            });
        }

        // Always include the absolute last known odds point if it wasn't captured by the step logic
        if (history.length > 0 && chartData.length > 0 && chartData[chartData.length - 1].timestamp !== history[history.length - 1].timestamp?.toISOString()) {
            chartData.push({
                timestamp: history[history.length - 1].timestamp?.toISOString() || new Date().toISOString(),
                oddsAmerican: history[history.length - 1].moneyline || 0
            });
        }

        return chartData;
    } catch (error) {
        console.error(`Failed to fetch odds history for fight ${fightId}:`, error);
        return [];
    }
}
