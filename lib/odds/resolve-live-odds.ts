// lib/odds/resolve-live-odds.ts
// Database-only odds resolution (no external API)

import { db } from "@/db/client";
import { historicalOdds } from "@/db/schema/historical-odds-schema";
import { fighters } from "@/db/schema/fighters-schema";
import { or, eq, desc } from "drizzle-orm";

export type OddsResult = {
  odds: [number, number] | null;
  source: 'database' | 'no_match';
  bookmaker?: string;
};

function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function findInDatabase(fighterA: string, fighterB: string): Promise<OddsResult | null> {
  try {
    // 1. Find Fighters by Name
    const allFighters = await db.select({
      id: fighters.id,
      firstName: fighters.firstName,
      lastName: fighters.lastName,
      nickname: fighters.nickname
    }).from(fighters);

    const normA = normalize(fighterA);
    const normB = normalize(fighterB);

    const searchFighter = (targetNorm: string) => {
      return allFighters.find(f => {
        const name = normalize(`${f.firstName} ${f.lastName}`);
        const revName = normalize(`${f.lastName} ${f.firstName}`);
        return name.includes(targetNorm) || targetNorm.includes(name) ||
          revName.includes(targetNorm) || targetNorm.includes(revName);
      });
    }

    const fA = searchFighter(normA);
    const fB = searchFighter(normB);

    if (!fA || !fB) return null;

    // 2. Find latest Odds for these fighters
    const oddsRecords = await db.select()
      .from(historicalOdds)
      .where(or(eq(historicalOdds.fighterId, fA.id), eq(historicalOdds.fighterId, fB.id)))
      .orderBy(desc(historicalOdds.timestamp));

    // Group by fight_id to find a match
    const fights = new Map<string, { [fighterId: string]: number }>();

    for (const record of oddsRecords) {
      if (!record.fightId) continue;

      if (!fights.has(record.fightId)) {
        fights.set(record.fightId, {});
      }
      // Use latest only (list is ordered desc)
      const fightGroup = fights.get(record.fightId)!;
      if (record.fighterId && !fightGroup[record.fighterId] && record.moneyline !== null) {
        fightGroup[record.fighterId] = record.moneyline;
      }
    }

    // Check if any fight has both
    for (const [fightId, oddsMap] of fights.entries()) {
      if (oddsMap[fA.id] !== undefined && oddsMap[fB.id] !== undefined) {
        return {
          odds: [oddsMap[fA.id], oddsMap[fB.id]],
          source: 'database'
        };
      }
    }

    return null;
  } catch (e) {
    console.error("DB Odds check failed", e);
    return null;
  }
}

export async function resolveLiveOdds(matchup: string): Promise<OddsResult> {
  const [fighterA, fighterB] = matchup.split(/ vs\.? /i);
  if (!fighterA || !fighterB) {
    console.warn(`⚠ Invalid matchup format: ${matchup}`);
    return { odds: null, source: 'no_match' };
  }

  // Check Database
  const dbResult = await findInDatabase(fighterA, fighterB);
  if (dbResult) {
    console.log(`✓ Odds found in DB: ${matchup}`);
    return dbResult;
  }

  console.warn(`⚠ No odds found in DB for: ${matchup}`);
  return { odds: null, source: 'no_match' };
}
