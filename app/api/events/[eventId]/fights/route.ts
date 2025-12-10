import axios from "axios";
import { load } from "cheerio";

export async function GET(req: Request, context: { params: { eventId: string } }) {
  const { eventId } = context.params;

  try {
    const response = await axios.get(`http://ufcstats.com/event-details/${eventId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = load(response.data);
    const fights: any[] = [];

    $(".b-fight-details__table-row").each((_, el) => {
      const fighter1 = $(el).find("a.b-link.b-link_style_black").eq(0).text().trim();
      const fighter2 = $(el).find("a.b-link.b-link_style_black").eq(1).text().trim();

      if (!fighter1 || !fighter2) return;

      fights.push({
        matchup: `${fighter1} vs ${fighter2}`,
        fighter1: { name: fighter1 },
        fighter2: { name: fighter2 },
      });
    });

    return Response.json({ fights });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
