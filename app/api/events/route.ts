import axios from "axios";
import { load } from "cheerio";

export async function GET() {
  const URL = "http://ufcstats.com/statistics/events/upcoming";

  try {
    const response = await axios.get(URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = load(response.data);
    const events: { id: string; name: string; date: string }[] = [];

    $(".b-statistics__table-row").each((_, el) => {
      const link = $(el).find("a").attr("href"); // event page
      const name = $(el).find("a").text().trim();
      const date = $(el).find(".b-statistics__date").text().trim();

      if (link) {
        const id = link.split("/event-details/")[1]?.replace("/", "");
        if (id) events.push({ id, name, date });
      }
    });

    return Response.json({ events });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
