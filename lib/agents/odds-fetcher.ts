// lib/agents/odds-fetcher.ts

export type FightOdds = {
    moneylines: [number, number]; // [Fighter A, Fighter B]
    totals?: {
      line: number; // e.g., 2.5 rounds
      over: number; // American odds
      under: number; // American odds
    };
    source?: string; // Which sportsbook provided the odds
  };
  
  const SPORTSBOOKS = [
    'draftkings',
    'fanduel',
    'betmgm',
    'caesars',
    'bet365'
  ];
  
  /**
   * Parse American odds from text (e.g., "-150", "+200", "−150")
   */
  function parseAmericanOdds(text: string): number | null {
    // Handle both regular minus and unicode minus
    const cleaned = text.replace(/[−–—]/g, '-').replace(/[^\d+-]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
  }
  
  /**
   * Extract moneyline odds from search result text
   */
  function extractMoneylines(text: string, fighterA: string, fighterB: string): [number, number] | null {
    const lines: string[] = text.split('\n');
    
    let fighterAOdds: number | null = null;
    let fighterBOdds: number | null = null;
  
    // Look for patterns like:
    // "Fighter Name -150" or "Fighter Name +200"
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check for Fighter A
      if (lowerLine.includes(fighterA.toLowerCase()) && !fighterAOdds) {
        const oddsMatch = line.match(/([+−–—-]\d{3,})/);
        if (oddsMatch) {
          fighterAOdds = parseAmericanOdds(oddsMatch[1]);
        }
      }
      
      // Check for Fighter B
      if (lowerLine.includes(fighterB.toLowerCase()) && !fighterBOdds) {
        const oddsMatch = line.match(/([+−–—-]\d{3,})/);
        if (oddsMatch) {
          fighterBOdds = parseAmericanOdds(oddsMatch[1]);
        }
      }
  
      if (fighterAOdds && fighterBOdds) break;
    }
  
    if (fighterAOdds && fighterBOdds) {
      return [fighterAOdds, fighterBOdds];
    }
  
    return null;
  }
  
  /**
   * Extract totals (over/under rounds) from text
   */
  function extractTotals(text: string): FightOdds['totals'] | null {
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Look for patterns like "Over 2.5 -110" or "O2.5 -110"
      if (lowerLine.includes('over') || lowerLine.includes('under') || /[ou]\d+\.5/.test(lowerLine)) {
        // Try to find the line (e.g., 2.5)
        const lineMatch = line.match(/(\d+\.5)/);
        if (!lineMatch) continue;
        
        const totalLine = parseFloat(lineMatch[1]);
        
        // Find over odds
        const overMatch = line.match(/over.*?([+−–—-]\d{3,})|o\d+\.5.*?([+−–—-]\d{3,})/i);
        // Find under odds
        const underMatch = line.match(/under.*?([+−–—-]\d{3,})|u\d+\.5.*?([+−–—-]\d{3,})/i);
        
        const overOdds = overMatch ? parseAmericanOdds(overMatch[1] || overMatch[2]) : null;
        const underOdds = underMatch ? parseAmericanOdds(underMatch[1] || underMatch[2]) : null;
        
        if (overOdds && underOdds) {
          return {
            line: totalLine,
            over: overOdds,
            under: underOdds
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Fetch live odds for a specific fight using web search
   */
  export async function fetchFightOdds(
    fighterA: string,
    fighterB: string,
    eventName?: string
  ): Promise<FightOdds> {
    
    for (const sportsbook of SPORTSBOOKS) {
      try {
        console.log(`  Trying ${sportsbook}...`);
        
        // Build search query
        const query = `${fighterA} vs ${fighterB} odds ${sportsbook}`;
        
        // Make web search request using Vercel AI SDK pattern
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            tools: [{
              type: 'web_search_20250305',
              name: 'web_search'
            }],
            messages: [{
              role: 'user',
              content: `Search for current betting odds for this fight: "${query}". I need moneyline odds for both fighters and the over/under total rounds line if available.`
            }]
          })
        });
  
        const data = await response.json();
        
        // Extract text from response
        let searchText = '';
        if (data.content) {
          for (const block of data.content) {
            if (block.type === 'text') {
              searchText += block.text + '\n';
            } else if (block.type === 'tool_use' && block.name === 'web_search') {
              // Tool use block might contain results
              searchText += JSON.stringify(block) + '\n';
            }
          }
        }
  
        // Try to extract odds
        const moneylines = extractMoneylines(searchText, fighterA, fighterB);
        
        if (moneylines) {
          const totals = extractTotals(searchText);
          
          return {
            moneylines,
            totals: totals || undefined,
            source: sportsbook
          };
        }
  
        console.log(`  ${sportsbook}: No odds found, trying next...`);
        
      } catch (error) {
        console.error(`  ${sportsbook} error:`, error);
        // Continue to next sportsbook
      }
    }
  
    // If all sportsbooks fail, throw error
    throw new Error(`Could not fetch odds for ${fighterA} vs ${fighterB} from any sportsbook`);
  }
  
  /**
   * Batch fetch odds for multiple fights with delay to avoid rate limits
   */
  export async function fetchMultipleFightOdds(
    fights: Array<{ fighterA: string; fighterB: string }>,
    delayMs: number = 2000
  ): Promise<Map<string, FightOdds>> {
    
    const oddsMap = new Map<string, FightOdds>();
    
    for (let i = 0; i < fights.length; i++) {
      const { fighterA, fighterB } = fights[i];
      const key = `${fighterA} vs ${fighterB}`;
      
      console.log(`\nFetching odds [${i + 1}/${fights.length}]: ${key}`);
      
      try {
        const odds = await fetchFightOdds(fighterA, fighterB);
        oddsMap.set(key, odds);
        console.log(`  ✓ Found: ${odds.moneylines[0]} / ${odds.moneylines[1]} (${odds.source})`);
        if (odds.totals) {
          console.log(`  ✓ Totals: O/U ${odds.totals.line} (${odds.totals.over}/${odds.totals.under})`);
        }
      } catch (error: any) {
        console.error(`  ✗ Failed: ${error.message}`);
        // Don't throw - let the caller decide how to handle missing odds
      }
      
      // Delay between requests to avoid rate limits
      if (i < fights.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return oddsMap;
  }