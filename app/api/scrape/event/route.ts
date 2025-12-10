import { NextResponse } from "next/server";
import { scrapeEventFights } from "@/lib/scraping/scrapeEventFights";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventUrl = searchParams.get("url");

  if (!eventUrl) {
    return NextResponse.json({ error: "Missing event URL" }, { status: 400 });
  }

  try {
    const fights = await scrapeEventFights(eventUrl);

    return NextResponse.json({
      fights,
      eventUrl,
      scrapedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
