import { auth } from "@/app/lib/auth/auth";
import { user, analysisRun } from "@/db/schema";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Agents from "@/app/ai/agents/agents";
import { FightResult } from "@/app/ai/agents/agents";

export async function POST(req: Request) {
  const authResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!authResult?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [resultUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, authResult.user.id))
    .limit(1);

  if (!resultUser) {
    return new Response("User not found", { status: 404 });
  }

  if (!resultUser.isPro && resultUser.analysisCount >= 3) {
    return new Response("Free limit reached", { status: 403 });
  }

  const { data } = await req.json();

  const simplifiedEvent = {
    EventId: data.EventId,
    Name: data.Name,
    fights: data.Fights
      .filter((f: any) => Array.isArray(f.Fighters) && f.Fighters.length === 2)
      .map((f: any) => {
        const [a, b] = f.Fighters;
        return {
          id: f.FightId,
          matchup: `${a.FirstName} ${a.LastName ?? ""} vs ${b.FirstName} ${b.LastName ?? ""}`,
          fighterIds: [a.FighterId, b.FighterId],
        };
      }),
  };

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (payload: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      };

      // 🔹 Immediately flush start event
      send({ type: "start", event: simplifiedEvent.Name });

      const allResults: FightResult[] = [];

      await Agents(simplifiedEvent, (update) => {
        send(update); // send EVERYTHING to the client

        if (update.type === 'fight') {
          allResults.push(update); // now TS is happy
        }
      });


      // Save AFTER streaming completes
      await db.insert(analysisRun).values({
        id: nanoid(),
        userId: authResult.user.id,
        title: simplifiedEvent.Name,
        eventId: simplifiedEvent.EventId,
        result: {
          mafsCoreEngine: allResults.map((r) => r.edge),
          fightBreakdowns: Object.fromEntries(
            allResults.map((r) => [r.fightId, r.breakdown])
          ),
        },
      });

      await db
        .update(user)
        .set({ analysisCount: resultUser.analysisCount + 1 })
        .where(eq(user.id, resultUser.id));

      send({ type: "complete" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
