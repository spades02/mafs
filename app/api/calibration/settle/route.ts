import { NextResponse } from "next/server";
import { db } from "@/db";
import { fights, fightSettlements, predictionLogs, mmaOddsData } from "@/db/schema";
import { fighters } from "@/db/schema/fighters-schema";
import { eq, isNull, ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";

// ufcstats.com hex hash → same BigInt ID used in our DB
function hashToId(hex: string): string {
  return BigInt("0x" + hex).toString();
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get unsettled fight IDs from prediction_logs
    const unsettledLogs = await db
      .selectDistinct({ fightId: predictionLogs.fightId, eventId: predictionLogs.eventId })
      .from(predictionLogs)
      .leftJoin(fightSettlements, eq(predictionLogs.fightId, fightSettlements.fightId))
      .where(isNull(fightSettlements.id));

    if (unsettledLogs.length === 0) {
      return NextResponse.json({ success: true, settled: 0, message: "No unsettled predictions" });
    }

    const unsettledFightIds = new Set(
      unsettledLogs.map((r) => r.fightId).filter(Boolean) as string[]
    );

    // 2. Fetch completed events from ufcstats.com
    const eventsRes = await fetch(
      "http://ufcstats.com/statistics/events/completed?page=all",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } }
    );
    if (!eventsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch ufcstats events" }, { status: 500 });
    }

    const eventsHtml = await eventsRes.text();
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Parse event rows
    const eventRowRegex = /href="(http:\/\/ufcstats\.com\/event-details\/([a-f0-9]+))"[\s\S]*?class="b-statistics__date">\s*([^<]+)\s*<\/span>/g;
    const recentEventUrls: Array<{ url: string; eventId: string }> = [];
    let match;

    while ((match = eventRowRegex.exec(eventsHtml)) !== null) {
      const eventDate = new Date(match[3].trim());
      if (eventDate >= ninetyDaysAgo && eventDate < cutoff) {
        recentEventUrls.push({ url: match[1], eventId: hashToId(match[2]) });
      }
    }

    let settledCount = 0;

    // 3. For each recent event, fetch fight details
    for (const { url, eventId } of recentEventUrls) {
      await new Promise((r) => setTimeout(r, 1000)); // polite delay

      const eventRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (!eventRes.ok) continue;

      const eventHtml = await eventRes.text();

      // Parse fight rows — same logic as n8n workflow
      const fightRowRegex = /href="http:\/\/ufcstats\.com\/fight-details\/([a-f0-9]+)"/g;
      const fightHashes: string[] = [];
      let fightMatch;
      while ((fightMatch = fightRowRegex.exec(eventHtml)) !== null) {
        fightHashes.push(fightMatch[1]);
      }

      for (const fightHash of fightHashes) {
        const fightId = hashToId(fightHash);
        if (!unsettledFightIds.has(fightId)) continue;

        // Fetch individual fight page for full result
        await new Promise((r) => setTimeout(r, 500));
        const fightRes = await fetch(`http://ufcstats.com/fight-details/${fightHash}`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        });
        if (!fightRes.ok) continue;

        const fightHtml = await fightRes.text();

        // Parse winner — green status = W, gray status = L
        // Each person block: status (W/L) then fighter link
        const personBlocks = [
          ...fightHtml.matchAll(
            /b-fight-details__person-status_(style_green|style_gray)[\s\S]*?fighter-details\/([a-f0-9]+)/g
          ),
        ];
        let winnerHash: string | null = null;
        for (const block of personBlocks) {
          if (block[1] === "style_green") {
            winnerHash = block[2];
            break;
          }
        }
        const winnerId = winnerHash ? hashToId(winnerHash) : null;

        // Parse method — appears as <i style="font-style: normal"> KO/TKO </i> after "Method:" label
        const methodMatch = fightHtml.match(/Method:[\s\S]*?<i style="font-style: normal">\s*([^<]+)\s*<\/i>/);
        const roundMatch = fightHtml.match(/Round:[\s\S]*?<i style="font-style: normal">\s*(\d+)\s*<\/i>/);

        const method = methodMatch ? methodMatch[1].trim() : null;
        const round = roundMatch ? parseInt(roundMatch[1]) : null;
        const wentDistance = method ? method.toLowerCase().includes("decision") : null;

        // Check already settled
        const [existing] = await db
          .select()
          .from(fightSettlements)
          .where(eq(fightSettlements.fightId, fightId))
          .limit(1);
        if (existing) continue;

        // Get our fight record for fighter IDs
        const [ourFight] = await db
          .select()
          .from(fights)
          .where(eq(fights.id, fightId))
          .limit(1);

        // Get closing odds from mma_odds_data by fighter name
        let closingOddsA: number | null = null;
        let closingOddsB: number | null = null;

        if (ourFight?.fighterAId) {
          const [fA] = await db.select({ firstName: fighters.firstName, lastName: fighters.lastName })
            .from(fighters).where(eq(fighters.id, ourFight.fighterAId)).limit(1);
          if (fA) {
            const lastNameA = fA.lastName || fA.firstName || "";
            const [oddsRowA] = await db.select({ ml: mmaOddsData.moneylineOdds })
              .from(mmaOddsData)
              .where(ilike(mmaOddsData.fighter, `%${lastNameA}%`))
              .limit(1);
            if (oddsRowA?.ml != null) closingOddsA = oddsRowA.ml;
          }
        }

        if (ourFight?.fighterBId) {
          const [fB] = await db.select({ firstName: fighters.firstName, lastName: fighters.lastName })
            .from(fighters).where(eq(fighters.id, ourFight.fighterBId)).limit(1);
          if (fB) {
            const lastNameB = fB.lastName || fB.firstName || "";
            const [oddsRowB] = await db.select({ ml: mmaOddsData.moneylineOdds })
              .from(mmaOddsData)
              .where(ilike(mmaOddsData.fighter, `%${lastNameB}%`))
              .limit(1);
            if (oddsRowB?.ml != null) closingOddsB = oddsRowB.ml;
          }
        }

        const logEntry = unsettledLogs.find((l) => l.fightId === fightId);

        await db.insert(fightSettlements).values({
          id: nanoid(),
          fightId,
          eventId: logEntry?.eventId ?? eventId,
          winnerId,
          method,
          round,
          wentDistance,
          closingOddsA,
          closingOddsB,
          dataSource: "ufcstats",
        });

        if (ourFight) {
          await db.update(fights).set({ winnerId, method, round }).where(eq(fights.id, fightId));
        }

        settledCount++;
      }
    }

    return NextResponse.json({ success: true, settled: settledCount });
  } catch (error) {
    console.error("[Settle] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Settlement failed" },
      { status: 500 }
    );
  }
}
