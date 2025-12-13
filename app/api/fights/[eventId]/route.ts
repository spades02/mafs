import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const apiKey = process.env.SPORTS_DATA_API_KEY;
  const { eventId } = await params;

  const res = await fetch(
    `https://api.sportsdata.io/v3/mma/scores/json/Event/${eventId}?key=${apiKey}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
