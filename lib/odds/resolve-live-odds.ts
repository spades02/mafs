// lib/odds/resolve-live-odds.ts

import { db } from "@/db/client";
import { historicalOdds } from "@/db/schema/historical-odds-schema";
import { fighters } from "@/db/schema/fighters-schema";
import { and, or, ilike, like, eq, desc } from "drizzle-orm";

export type OddsResult = {
  odds: [number, number] | null;
  source: 'api' | 'database' | 'no_match' | 'api_error' | 'no_api_key';
  bookmaker?: string;
};

function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Types for external cache
export type OddsCache = any[];

// Global cache variables (fallback for when cache not passed)
let oddsCache: OddsCache | null = null;
let lastFetch = 0;

/**
 * Fetch all MMA odds upfront (Fix 7: avoid multiple API calls)
 * Call this once at the start of analysis and pass result to resolveLiveOdds
 */
export async function fetchAllOdds(): Promise<{ cache: OddsCache | null; error?: string }> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return { cache: null, error: 'no_api_key' };
  }

  try {
    console.log('🔄 Fetching all MMA odds in batch...');
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      console.error(`✗ Odds API error: ${res.status}`);
      return { cache: null, error: 'api_error' };
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return { cache: null, error: 'invalid_response' };
    }

    // Also update global cache for backwards compatibility
    oddsCache = data;
    lastFetch = Date.now();

    return { cache: data };
  } catch (err: any) {
    console.error('✗ Odds fetch failed:', err.message);
    return { cache: null, error: err.message };
  }
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
        // Found a match!
        // odds order: [A, B]
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

export async function resolveLiveOdds(
  matchup: string,
  preloadedCache?: OddsCache | null
): Promise<OddsResult> {
  const apiKey = process.env.ODDS_API_KEY;

  const [fighterA, fighterB] = matchup.split(/ vs\.? /i);
  if (!fighterA || !fighterB) {
    console.warn(`⚠ Invalid matchup format: ${matchup}`);
    return { odds: null, source: 'no_match' };
  }

  const a = normalize(fighterA);
  const b = normalize(fighterB);

  // 1. Check Database First
  const dbResult = await findInDatabase(fighterA, fighterB);
  if (dbResult) {
    console.log(`✓ Odds found in DB: ${matchup}`);
    return dbResult;
  }

  // 2. Fallback to API/Cache
  if (!apiKey) {
    console.warn('⚠ ODDS_API_KEY not set');
    return { odds: null, source: 'no_api_key' };
  }

  try {
    // Fix 7: Use preloaded cache if provided, else fall back to global cache
    let events: OddsCache;

    if (preloadedCache && preloadedCache.length > 0) {
      // Use provided cache (batch fetched at start of analysis)
      events = preloadedCache;
    } else if (oddsCache && (Date.now() - lastFetch < 600000)) { // 10 min cache
      // Use valid global cache
      events = oddsCache;
    } else {
      // Fetch fresh (fallback for backwards compatibility)
      console.log('🔄 Fetching fresh odds from API...');

      const res = await fetch(
        `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`,
        { cache: 'no-store' }
      );

      if (!res.ok) {
        console.error(`✗ Odds API error: ${res.status}`);
        return { odds: null, source: 'api_error' };
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error('✗ Odds API returned non-array');
        return { odds: null, source: 'api_error' };
      }

      oddsCache = data;
      lastFetch = Date.now();
      events = data;
    }

    // 3. Search for the match
    for (const event of events) {
      for (const bookmaker of event.bookmakers ?? []) {
        const market = bookmaker.markets?.find((m: any) => m.key === 'h2h');
        if (!market || market.outcomes?.length !== 2) continue;

        const o1Name = normalize(market.outcomes[0].name);
        const o2Name = normalize(market.outcomes[1].name);

        // Check for match (A vs B OR B vs A)
        const directMatch =
          (o1Name.includes(a) && o2Name.includes(b)) ||
          (o1Name.includes(b) && o2Name.includes(a));

        if (!directMatch) continue;

        // Ensure we assign the correct odds to the correct fighter
        const odds: [number, number] = o1Name.includes(a)
          ? [market.outcomes[0].price, market.outcomes[1].price]
          : [market.outcomes[1].price, market.outcomes[0].price];

        console.log(
          `✓ Odds matched in API: ${fighterA} ${odds[0]} / ${odds[1]} ${fighterB} (${bookmaker.title})`
        );

        return {
          odds,
          source: 'api',
          bookmaker: bookmaker.title
        };
      }
    }

    console.warn(`⚠ No odds match found for: ${matchup}`);
    return { odds: null, source: 'no_match' };

  } catch (err: any) {
    console.error('✗ Odds logic failed:', err.message);
    return { odds: null, source: 'api_error' };
  }
}
