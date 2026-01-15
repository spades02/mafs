// lib/odds/resolve-live-odds.ts

export type OddsResult = {
  odds: [number, number] | null;
  source: 'api' | 'no_match' | 'api_error' | 'no_api_key';
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

export async function resolveLiveOdds(
  matchup: string,
  preloadedCache?: OddsCache | null
): Promise<OddsResult> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.warn('⚠ ODDS_API_KEY not set');
    return { odds: null, source: 'no_api_key' };
  }

  const [fighterA, fighterB] = matchup.split(/ vs\.? /i);
  if (!fighterA || !fighterB) {
    console.warn(`⚠ Invalid matchup format: ${matchup}`);
    return { odds: null, source: 'no_match' };
  }

  const a = normalize(fighterA);
  const b = normalize(fighterB);

  try {
    // Fix 7: Use preloaded cache if provided, else fall back to global cache
    let events: OddsCache;

    if (preloadedCache && preloadedCache.length > 0) {
      // Use provided cache (batch fetched at start of analysis)
      events = preloadedCache;
    } else if (oddsCache && (Date.now() - lastFetch < 60000)) {
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
          `✓ Odds matched: ${fighterA} ${odds[0]} / ${odds[1]} ${fighterB} (${bookmaker.title})`
        );

        return {
          odds,
          source: 'api',
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