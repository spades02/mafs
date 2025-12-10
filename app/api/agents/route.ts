import { NextResponse } from "next/server";
import { mockCardData } from "@/lib/data/mock-data"; // adjust to your export
import Agents from "@/app/ai/agents/agents";

export async function GET() {
  try {
    const data = mockCardData.fights[1].matchup;
    console.log(data)
    const result = await Agents(data); // <-- test with mock data
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Agent test failed" }, { status: 500 });
  }
}
