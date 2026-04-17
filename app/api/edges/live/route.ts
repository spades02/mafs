import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { predictionLogs } from "@/db/schema/prediction-logs-schema"
import { fighters } from "@/db/schema/fighters-schema"
import { events } from "@/db/schema/events-schema"
import { fights } from "@/db/schema/fights-schema"
import { desc, eq, and, gt, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

const fighterA = alias(fighters, "fighter_a")
const fighterB = alias(fighters, "fighter_b")
const pickedFighter = alias(fighters, "picked_fighter")

function lastName(full: string): string {
  const parts = full.trim().split(/\s+/)
  return parts[parts.length - 1] || full
}
function buildMatchup(a: string, b: string): string {
  if (!a && !b) return ""
  if (!a) return b
  if (!b) return a
  return `${lastName(a)} vs ${lastName(b)}`
}

export async function GET() {
  try {
    const now = new Date()
    
    const edgeSelect = {
      logId: predictionLogs.id,
      betType: predictionLogs.label,
      modelProb: predictionLogs.modelProb,
      marketProb: predictionLogs.marketProb,
      edgePct: predictionLogs.edgePct,
      oddsAmerican: predictionLogs.oddsAmerican,
      confidencePct: predictionLogs.confidencePct,
      createdAt: predictionLogs.createdAt,
      fighterId: predictionLogs.fighterId,
      eventId: predictionLogs.eventId,
      fightId: predictionLogs.fightId,
      pickFName: pickedFighter.firstName,
      pickLName: pickedFighter.lastName,
      aFName: fighterA.firstName,
      aLName: fighterA.lastName,
      bFName: fighterB.firstName,
      bLName: fighterB.lastName,
      eventName: events.name,
    }

    // Fetch top live edges for future events
    let topEdgesRaw = await db.select(edgeSelect)
      .from(predictionLogs)
      .innerJoin(events, eq(predictionLogs.eventId, events.eventId))
      .leftJoin(fights, eq(predictionLogs.fightId, fights.id))
      .leftJoin(fighterA, eq(fights.fighterAId, fighterA.id))
      .leftJoin(fighterB, eq(fights.fighterBId, fighterB.id))
      .leftJoin(pickedFighter, eq(predictionLogs.fighterId, pickedFighter.id))
      .where(
        and(
          gt(events.dateTime, now),
          gt(predictionLogs.edgePct, 3),
          gt(predictionLogs.modelProb, predictionLogs.marketProb),
          sql`LOWER(${predictionLogs.label}) != 'no bet'`
        )
      )
      .orderBy(desc(predictionLogs.edgePct))
      .limit(10)

    // Fallback to historical edges if no live future ones exist
    if (topEdgesRaw.length < 3) {
      const historicalEdgesRaw = await db.select(edgeSelect)
        .from(predictionLogs)
        .innerJoin(events, eq(predictionLogs.eventId, events.eventId))
        .leftJoin(fights, eq(predictionLogs.fightId, fights.id))
        .leftJoin(fighterA, eq(fights.fighterAId, fighterA.id))
        .leftJoin(fighterB, eq(fights.fighterBId, fighterB.id))
        .leftJoin(pickedFighter, eq(predictionLogs.fighterId, pickedFighter.id))
        .where(
          and(
            gt(predictionLogs.edgePct, 5),
            gt(predictionLogs.modelProb, predictionLogs.marketProb),
            sql`LOWER(${predictionLogs.label}) != 'no bet'`
          )
        )
        .orderBy(desc(predictionLogs.edgePct))
        .limit(10 - topEdgesRaw.length)
      
      topEdgesRaw = [...topEdgesRaw, ...historicalEdgesRaw]
    }

    const mapConfidence = (pct: number | null) => {
      if (!pct) return "Medium"
      if (pct > 80) return "High"
      if (pct > 60) return "Medium"
      return "Low"
    }

    const parseFighterFallback = (label: string) => {
      if (!label) return ''
      const lower = label.toLowerCase()
      if (lower.includes('over ') || lower.includes('under ') || lower.includes('goes to') || lower.includes('gtd') || lower.includes('starts')) return ''
      if (label.includes(' by ')) return label.split(' by ')[0]
      if (label.includes(' ML')) return label.split(' ML')[0]
      if (label.includes(' ITD')) return label.split(' ITD')[0]
      if (label.includes(' Dec')) return label.split(' Dec')[0]
      return label.length < 20 ? label : ''
    }

    const edges = topEdgesRaw.map(e => {
      const pickName = `${e.pickFName || ''} ${e.pickLName || ''}`.trim()
      const aName = `${e.aFName || ''} ${e.aLName || ''}`.trim()
      const bName = `${e.bFName || ''} ${e.bLName || ''}`.trim()
      const matchupLabel = buildMatchup(aName, bName)

      let finalTitle = pickName
      let finalSubtitle = e.betType || 'Moneyline'
      let type: 'fighter' | 'prop' = 'fighter'

      if (!pickName) {
        const parsed = parseFighterFallback(e.betType)
        if (parsed) {
          finalTitle = parsed
          finalSubtitle = e.betType
        } else {
          finalTitle = matchupLabel || (e.betType || 'Fight Prop')
          finalSubtitle = e.betType || 'Fight Prop'
          type = 'prop'
        }
      }

      return {
        id: e.logId,
        fighterName: finalTitle,
        betType: finalSubtitle,
        modelProb: Math.round((e.modelProb || 0) * 100),
        marketProb: Math.round((e.marketProb || 0) * 100),
        edgePct: Math.round(e.edgePct || 0),
        confidence: mapConfidence(e.confidencePct),
        detectedAt: e.createdAt.toISOString(),
        eventName: e.eventName || 'UFC Event',
        type,
        matchupLabel,
        pickFighterName: pickName || null,
      }
    })

    return NextResponse.json(
      { edges, count: edges.length, timestamp: new Date().toISOString() },
      { 
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      }
    )
  } catch (error) {
    console.error("Failed to fetch live edges:", error)
    return NextResponse.json(
      { edges: [], count: 0, timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
