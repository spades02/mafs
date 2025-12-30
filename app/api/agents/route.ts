import { NextResponse } from "next/server";
import Agents from "@/app/ai/agents/agents";
import { auth } from "@/app/lib/auth/auth";
import { user } from "@/db/schema"
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const authResult = await auth.api.getSession({
    headers: await headers()
  });

  if (!authResult?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // 🔑 Fetch DB user
  const dbUser = await db
    .select()
    .from(user)
    .where(eq(user.id, authResult.user.id))
    .limit(1);
  
  if (!dbUser.length) {
    return new Response("User not found", { status: 404 });
  }
  
  const resultUser = dbUser[0];
  
  // ✅ NOW this works
  if (!resultUser.isPro && resultUser.analysisCount >= 3) {
    return new Response("Free limit reached", { status: 403 });
  }
  

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

    await db
    .update(user)
    .set({
      analysisCount: resultUser.analysisCount + 1
    })
    .where(eq(user.id, resultUser.id))

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
