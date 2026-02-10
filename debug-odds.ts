
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';

async function fetchOdds() {
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
        fs.writeFileSync('debug_log.txt', "No ODDS_API_KEY found");
        return;
    }
    const url = `https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;
    let log = `Fetching from: ${url.replace(apiKey, "HIDDEN_KEY")}\n`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            log += `API Error: ${res.status} ${res.statusText}\n`;
            const text = await res.text();
            log += `Body: ${text}\n`;
            fs.writeFileSync('debug_log.txt', log);
            return;
        }
        const data: any = await res.json();
        log += `Fetched ${data.length} events.\n`;

        data.forEach((event: any) => {
            log += `Event: ${event.commence_time} - ${event.home_team} vs ${event.away_team}\n`;
            if (event.bookmakers && event.bookmakers.length > 0) {
                const market = event.bookmakers[0].markets.find((m: any) => m.key === 'h2h');
                if (market) {
                    log += `  Odds: ${market.outcomes.map((o: any) => `${o.name} (${o.price})`).join(' vs ')}\n`;
                }
            } else {
                log += `  No bookmakers found\n`;
            }
        });
        fs.writeFileSync('debug_log.txt', log);

    } catch (e: any) {
        log += `Fetch failed: ${e.message}\n`;
        fs.writeFileSync('debug_log.txt', log);
    }
}

fetchOdds();
