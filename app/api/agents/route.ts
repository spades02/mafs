import { auth } from "@/app/lib/auth/auth";
import { user, analysisRun } from "@/db/schema";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Agents from "@/app/ai/agents/agents";
import {FightResult} from "@/app/ai/agents/agents"

export async function POST(req: Request) {
  const authResult = await auth.api.getSession({
    headers: await headers()
  });

  if (!authResult?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const dbUser = await db
    .select()
    .from(user)
    .where(eq(user.id, authResult.user.id))
    .limit(1);
  
  if (!dbUser.length) {
    return new Response("User not found", { status: 404 });
  }
  
  const resultUser = dbUser[0];
  
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

    // Create streaming response
    const stream = new ReadableStream({
      // In your route handler, after the stream closes:
async start(controller) {
  const encoder = new TextEncoder();
  const allResults: FightResult[] = [];
  
  await Agents(simplifiedEvent, (fightResult) => {
    allResults.push(fightResult);
    const message = JSON.stringify(fightResult) + '\n';
    controller.enqueue(encoder.encode(message));
  });

  // Save to database after all fights complete
  await db.insert(analysisRun).values({
    id: nanoid(),
    userId: authResult.user.id,
    title: simplifiedEvent.Name,
    eventId: simplifiedEvent.EventId,
    result: {
      mafsCoreEngine: allResults.map(r => r.edge),
      fightBreakdowns: Object.fromEntries(
  allResults.map(r => [r.fightId, r.breakdown])
),
    },
  });

  await db
    .update(user)
    .set({ analysisCount: resultUser.analysisCount + 1 })
    .where(eq(user.id, resultUser.id));

  controller.enqueue(encoder.encode(JSON.stringify({ type: 'complete' }) + '\n'));
  controller.close();
},
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Agent error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Agent processing failed" }),
      { status: 500 }
    );
  }
}