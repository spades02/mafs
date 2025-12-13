import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.SPORTS_DATA_API_KEY;

  const res = await fetch(
    `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/2026?key=${apiKey}`
  );

  const data = await res.json();
  return NextResponse.json(data);
}
