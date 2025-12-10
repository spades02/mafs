import axios from 'axios';
import axiosRetry from 'axios-retry';
import { load } from 'cheerio';
import { UFCFight, ScrapingResult } from './types';

// Configure retry logic for reliability
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.response?.status === 429
});

export class UFCScraper {
  private readonly UFC_STATS_URL = 'http://ufcstats.com/statistics/events/upcoming';
  // optional small delay between event page requests (ms)
  private readonly perEventDelay = 500;

  async scrapeUpcomingFights(): Promise<ScrapingResult> {
    try {
      // Fetch the main events page
      const response = await axios.get(this.UFC_STATS_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UFC-Scraper/1.0)' },
        timeout: 15000
      });

      const $ = load(response.data);
      const events: Array<{
        name: string;
        date: string;
        location: string;
        url: string;
        fights: UFCFight[];
      }> = [];

      // Iterate rows in the events table and find rows that contain the event anchor
      $('table.b-statistics__table-events tbody tr.b-statistics__table-row').each((_, el) => {
        const row = $(el);
        const anchor = row.find('a.b-link.b-link_style_black').first();
        if (!anchor || !anchor.attr('href')) return; // skip non-event rows

        const eventName = anchor.text().trim();
        const eventUrl = anchor.attr('href')!.trim();
        const eventDate = row.find('.b-statistics__date').text().trim();
        const location = row.find('td').eq(1).text().trim();

        events.push({
          name: eventName,
          date: eventDate,
          location,
          url: eventUrl,
          fights: []
        });
      });

      // For each event, fetch its details page and extract fights (sequential for politeness)
      for (const evt of events) {
        try {
          const evRes = await axios.get(evt.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UFC-Scraper/1.0)' },
            timeout: 15000
          });
          const $$ = load(evRes.data);

          // Strategy:
          // Find all table rows that contain at least two fighter links (robust fallback)
          const fightRows = $$('tr').filter((_, rowEl) => {
            const anchors = $$(rowEl).find('a.b-link.b-link_style_black');
            return anchors.length >= 2;
          });

          // If we found fight rows, extract fight pairs from each row
          if (fightRows.length > 0) {
            fightRows.each((_, rowEl) => {
              const r = $$(rowEl);
              const anchors = r.find('a.b-link.b-link_style_black');
              // There can be more than 2 anchors in some rows; pick the first two as the fighters
              if (anchors.length >= 2) {
                const fighter1 = anchors.eq(0).text().trim();
                const fighter2 = anchors.eq(1).text().trim();
                if (fighter1 && fighter2) {
                  evt.fights.push({
                    fight: `${fighter1} vs ${fighter2}`,
                    fighter1: { name: fighter1 },
                    fighter2: { name: fighter2 },
                    eventName: evt.name,
                    date: evt.date
                  } as UFCFight);
                }
              }
            });
          } else {
            // Fallback: some pages might use a different structure - try a looser search
            const anchorCandidates = $$('a.b-link.b-link_style_black').toArray();
            for (let i = 0; i < anchorCandidates.length - 1; i += 2) {
              const f1 = $$(anchorCandidates[i]).text().trim();
              const f2 = $$(anchorCandidates[i + 1]).text().trim();
              // basic sanity: ensure they look like fighter names (non-empty)
              if (f1 && f2) {
                evt.fights.push({
                  fight: `${f1} vs ${f2}`,
                  fighter1: { name: f1 },
                  fighter2: { name: f2 },
                  eventName: evt.name,
                  date: evt.date
                } as UFCFight);
              }
            }
          }

          // polite delay to avoid hammering the site
          await this.delay(this.perEventDelay);
        } catch (innerErr: any) {
          console.warn(`Failed to fetch event page ${evt.url}:`, innerErr?.message ?? innerErr);
          // continue with next event
        }
      }

      // Build final ScrapingResult structure (grouped by event)
      const result: ScrapingResult = {
        scrapedAt: new Date(),
        source: this.UFC_STATS_URL,
        events: events.map(e => ({
          event: e.name,
          date: e.date,
          location: e.location,
          url: e.url,
          fights: e.fights
        }))
      } as unknown as ScrapingResult; // adapt as needed to your ScrapingResult type shape

      return result;
    } catch (error: any) {
      console.error('Scraping failed:', error);
      throw new Error(`Failed to scrape UFC data: ${error.message}`);
    }
  }

  // helper delay
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
