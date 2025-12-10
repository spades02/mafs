import axios from "axios";
import { load } from "cheerio";

export async function scrapeEventFights(eventUrl: string) {
  const response = await axios.get(eventUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (UFC-Scraper)"
    }
  });

  const $ = load(response.data);

  const fights: any[] = [];

  $("table.b-fight-details__table tbody tr").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length === 0) return;

    const boutUrl = $(el)
      .attr("onclick")
      ?.replace("doNav('", "")
      .replace("')", "");

    const fighters = $(tds[1]).find("p");

    const fighter1 = fighters.eq(0).text().trim();
    const fighter2 = fighters.eq(1).text().trim();

    if (!fighter1 || !fighter2) return;

    fights.push({
      fight: `${fighter1} vs ${fighter2}`,
      fighter1: { name: fighter1 },
      fighter2: { name: fighter2 },
      boutUrl
    });
  });

  return fights;
}
