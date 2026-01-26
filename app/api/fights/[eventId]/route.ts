import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { fights, fighters, events } from "@/db/schema";
import { eq, aliasedTable } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    // 1. Fetch Event Info
    const eventRecord = await db.query.events.findFirst({
      where: eq(events.eventId, BigInt(eventId)),
    });

    if (!eventRecord) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 2. Fetch Fights with Fighter Details
    const f1 = aliasedTable(fighters, "f1");
    const f2 = aliasedTable(fighters, "f2");

    const fightsData = await db
      .select({
        fight: fights,
        fighter1: f1,
        fighter2: f2,
      })
      .from(fights)
      .leftJoin(f1, eq(fights.fighter1Id, f1.id))
      .leftJoin(f2, eq(fights.fighter2Id, f2.id))
      .where(eq(fights.eventId, BigInt(eventId)));

    // 3. Transform to match API Shape
    // Serialize BigInts to strings for JSON safety
    const mappedFights = fightsData.map((row) => ({
      FightId: row.fight.fightId.toString(),
      Order: row.fight.order,
      Status: row.fight.status,
      WeightClass: row.fight.weightClass,
      CardSegment: row.fight.cardSegment,
      Fighters: [
        {
          FighterId: row.fighter1?.id,
          FirstName: row.fighter1?.firstName,
          LastName: row.fighter1?.lastName,
        },
        {
          FighterId: row.fighter2?.id,
          FirstName: row.fighter2?.firstName,
          LastName: row.fighter2?.lastName,
        }
      ]
    }));

    return NextResponse.json({
      EventId: eventRecord.eventId.toString(),
      Name: eventRecord.name,
      DateTime: eventRecord.dateTime,
      Fights: mappedFights
    });

    return NextResponse.json({
      EventId: eventRecord.eventId,
      Name: eventRecord.name,
      DateTime: eventRecord.dateTime,
      Fights: mappedFights
    });

  } catch (error) {
    console.error("DB Error fetching event fights:", error);
    return NextResponse.json(
      { error: "Failed to fetch event fights" },
      { status: 500 }
    );
  }
}
