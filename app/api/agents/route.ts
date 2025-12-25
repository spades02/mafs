import { NextResponse } from "next/server";
import Agents from "@/app/ai/agents/agents";

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    const simplifiedEvent = {
      EventId: data.EventId,
      Name: data.Name,
      fights: data.Fights
        .filter((f: any) => Array.isArray(f.Fighters) && f.Fighters.length === 2)
        .map((f: any) => {
          const [a, b] = f.Fighters;
    
          const fighterAName = `${a.FirstName}${a.LastName ? " " + a.LastName : ""}`;
          const fighterBName = `${b.FirstName}${b.LastName ? " " + b.LastName : ""}`;
    
          return {
            id: f.FightId,
            matchup: `${fighterAName} vs ${fighterBName}`,
            moneylines: [a.Moneyline, b.Moneyline],
          };
        }),
    };    

    const result = await Agents(simplifiedEvent);

    return NextResponse.json({
      mafsCoreEngine: result.mafsCoreEngine,
      fightBreakdowns: result.fightBreakdowns,
    });
  } catch (error: any) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: error.message || "Agent processing failed" },
      { status: 500 }
    );
  }
}
