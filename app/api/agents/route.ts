import { NextResponse } from "next/server";
import Agents from "@/app/ai/agents/agents";

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    const simplifiedEvent = {
      EventId: data.EventId,
      Name: data.Name,
      Fights: data.Fights.map((f: any) => ({
        matchup: `${f.Fighters[0].FirstName} ${f.Fighters[0].LastName} vs ${f.Fighters[1].FirstName} ${f.Fighters[1].LastName}`,
        weightClass: f.WeightClass,
        moneylines: f.Fighters.map((fi: any) => fi.Moneyline),
      })),
    };

    const result = await Agents(JSON.stringify(simplifiedEvent));

    // ✅ Don't re-parse, just return the data
    return NextResponse.json({
      mafsCoreEngine: result.mafsCoreEngine,
      fightBreakdowns: result.fightBreakdowns
    });

  } catch (error: any) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: error.message || "Agent processing failed" },
      { status: 500 }
    );
  }
}