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

// Global cache variables (outside the function scope)
let oddsCache: any = null;
let lastFetch = 0;

export async function resolveLiveOdds(matchup: string): Promise<OddsResult> {
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
    const now = Date.now();
    const CACHE_DURATION = 60000; // 60 seconds

    // 1. Check if we need to refresh the cache
    if (!oddsCache || now - lastFetch > CACHE_DURATION) {
      console.log('🔄 Fetching fresh odds from API...');
      
      const res = await fetch(
        `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`,
        { cache: 'no-store' }
      );

      if (!res.ok) {
        console.error(`✗ Odds API error: ${res.status}`);
        // If the API fails, return error immediately to avoid overwriting a potentially stale (but valid) cache
        return { odds: null, source: 'api_error' };
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.error('✗ Odds API returned non-array');
        return { odds: null, source: 'api_error' };
      }

      // Update the global cache
      oddsCache = data;
      lastFetch = now;
    } else {
      // console.log('⚡ Using cached odds...'); // Optional log
    }

    // 2. Use the Cache (guaranteed to be set now if no error occurred)
    const events = oddsCache;

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