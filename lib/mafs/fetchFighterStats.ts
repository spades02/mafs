// lib/mafs/fetchFighterStats.ts
import { db } from "@/db/db";
import { fighters } from "@/db/schema/fighters-schema";
import { eq, and, sql, ilike } from "drizzle-orm";

export interface MafsFighterInput {
  id: string;
  name: string;
  nickname: string;
  weightClass: string;
  height: number;
  reach: number;
  strikingPerMinute: number;
  strikingAccuracy: number;
  takedownAverage: number;
  submissionAverage: number;
  knockoutPct: number;
  tkoPct: number;
  decisionPct: number;
  wins: number;
  losses: number;
  titleWins: number;
  titleLosses: number;
}

export interface EventFighter {
  id: string;
  name: string;
}

export interface MafsEventInput {
  fighters: MafsFighterInput[];
}

/**
 * Fetches a single fighter profile from Local DB and normalizes it for MAFS
 */
async function fetchFighterProfile(fighterId: string, name?: string): Promise<MafsFighterInput> {
  try {
    // 1. Try to fetch by ID first (if provided)
    let fighterRecord: any = null;

    if (fighterId && fighterId.length > 0) {
      const results = await db
        .select()
        .from(fighters)
        .where(eq(fighters.id, fighterId))
        .limit(1);

      if (results.length > 0) fighterRecord = results[0];
    }

    // 2. If no ID match, try Name match (Exact or Fuzzy)
    if (!fighterRecord && name) {
      // Normalize name for search
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        const fName = parts[0];
        const lName = parts.slice(1).join(" "); // Handle multi-part last names

        // Try exact match on first/last
        const results = await db
          .select()
          .from(fighters)
          .where(
            and(
              sql`lower(${fighters.firstName}) = lower(${fName})`,
              sql`lower(${fighters.lastName}) = lower(${lName})`
            )
          )
          .limit(1);

        if (results.length > 0) {
          fighterRecord = results[0];
        } else {
          // Fallback: Try "fuzzy" ILIKE search
          const likeResults = await db
            .select()
            .from(fighters)
            .where(
              and(
                ilike(fighters.lastName, `%${lName}%`),
                ilike(fighters.firstName, `%${fName}%`)
              )
            )
            .limit(1);

          if (likeResults.length > 0) fighterRecord = likeResults[0];
        }
      }
    }

    if (fighterRecord) {
      // Safely access properties, defaulting to 0 if column is missing from schema
      return {
        id: fighterRecord.id,
        name: `${fighterRecord.firstName} ${fighterRecord.lastName}`,
        nickname: fighterRecord.nickname || "",
        weightClass: (fighterRecord as any).weightClass || "",
        height: fighterRecord.heightIn || 0,
        reach: fighterRecord.reachIn || 0,
        strikingPerMinute: (fighterRecord as any).slpm || 0,
        strikingAccuracy: (fighterRecord as any).strAcc || 0,
        takedownAverage: (fighterRecord as any).tdAvg || 0,
        submissionAverage: (fighterRecord as any).subAvg || 0,
        knockoutPct: 0,
        tkoPct: 0,
        decisionPct: 0,
        wins: (fighterRecord as any).wins || 0,
        losses: (fighterRecord as any).losses || 0,
        titleWins: 0,
        titleLosses: 0,
      };
    }

    console.warn(`Fighter not found in DB: ${name} (ID: ${fighterId})`);

  } catch (err: any) {
    console.warn(`Database error fetching fighter ${fighterId}/${name}: ${err.message}`);
  }

  // Return fallback
  return {
    id: fighterId,
    name: name || "Unknown Fighter",
    nickname: "",
    weightClass: "",
    height: 0,
    reach: 0,
    strikingPerMinute: 0,
    strikingAccuracy: 0,
    takedownAverage: 0,
    submissionAverage: 0,
    knockoutPct: 0,
    tkoPct: 0,
    decisionPct: 0,
    wins: 0,
    losses: 0,
    titleWins: 0,
    titleLosses: 0,
  };
}

/**
 * Takes an array of EventFighters (with fighter IDs) and returns MAFS-ready structure
 */
export async function buildMafsEventInput(fighters: EventFighter[]): Promise<MafsEventInput> {
  const fighterProfiles = await Promise.all(
    fighters.map(f => fetchFighterProfile(f.id, f.name))
  );

  return { fighters: fighterProfiles };
}
