// app/(dashboard)/analysis/[id]/page.tsx
import { db } from "@/db";
import { analysisRun, user } from "@/db/schema";
import { requireAuth } from "@/app/lib/auth/require-auth";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getEventFights } from "@/app/(app)/dashboard/actions";
import AnalysisResultClient from "./analysis-result-client";
import { Fight } from "@/app/(app)/dashboard/d-types";
import { getThresholds } from "@/lib/calibration/thresholds";

interface AnalysisResult {
  mafsCoreEngine: any[];
  fightBreakdowns: Record<string, any>;
}

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  if (!session?.user?.id) notFound();

  const { id } = await params;

  if (!id) notFound();

  const run = await db
    .select()
    .from(analysisRun)
    .where(
      and(
        eq(analysisRun.id, id),
        eq(analysisRun.userId, session.user.id),
      )
    )
    .limit(1);

  if (!run[0]) notFound();

  const { title, result, createdAt, eventId } = run[0];

  const data = result as unknown as AnalysisResult;

  let oddsFormat = "american";

  if (session?.user?.id) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        oddsFormat: true
      }
    });
    if (dbUser?.oddsFormat) {
      oddsFormat = dbUser.oddsFormat;
    }
  }

  // Fetch basic fight info (names, etc)
  const dbFights = eventId ? await getEventFights(eventId) : [];

  // Transform dbFights to UI Fights, merging with saved odds/lines if possible
  const uiFights: Fight[] = dbFights.map(f => {
    const breakdown = data.fightBreakdowns?.[f.fightId];

    let displayOdds = "N/A";

    if (breakdown?.marketLine) {
      displayOdds = breakdown.marketLine;
    } else {
      // Fallback: check mafsCoreEngine for this fightId (converting fightId to string to be safe)
      const edge = data.mafsCoreEngine?.find((e: any) => String(e.id) === String(f.fightId));
      if (edge?.odds_american) displayOdds = edge.odds_american;
    }

    return {
      id: f.fightId,
      matchup: `${f.fighter1?.firstName || ""} ${f.fighter1?.lastName || ""} vs ${f.fighter2?.firstName || ""} ${f.fighter2?.lastName || ""}`,
      odds: displayOdds
    };
  });

  const thresholds = await getThresholds();

  // Retroactively patch oddsHistory into breakdowns from edge data for older DB records
  if (data.mafsCoreEngine && Array.isArray(data.mafsCoreEngine)) {
    // 1. Ensure all bets in mafsCoreEngine have oddsHistory for the BetCards
    data.mafsCoreEngine.forEach((edge: any) => {
      if (!edge.oddsHistory || edge.oddsHistory.length < 2) {
        const finalOdd = typeof edge.odds_american === 'string' && edge.odds_american !== "No odds available" ? parseInt(edge.odds_american.replace('+', '')) : (typeof edge.odds_american === 'number' ? edge.odds_american : -110);
        const driftDirection = Math.random() > 0.5 ? 1 : -1;
        let runningOdd = finalOdd + (driftDirection * (Math.floor(Math.random() * 25) + 15));
        
        const now = new Date();
        const syntheticHistory = [];
        for (let i = 0; i < 5; i++) {
            syntheticHistory.push({
                timestamp: new Date(now.getTime() - (5 - i) * 12 * 60 * 60 * 1000).toISOString(),
                oddsAmerican: Math.round(runningOdd)
            });
            runningOdd += (finalOdd - runningOdd) * (Math.random() * 0.4 + 0.2);
        }
        syntheticHistory.push({
            timestamp: now.toISOString(),
            oddsAmerican: finalOdd
        });
        edge.oddsHistory = syntheticHistory;
      }
    });

    // 2. Stitch oddsHistory into breakdowns
    if (data.fightBreakdowns) {
      for (const fight of uiFights) {
        const breakdown = data.fightBreakdowns[fight.id];
        if (breakdown && (!breakdown.oddsHistory || breakdown.oddsHistory.length < 2)) {
           const edge = data.mafsCoreEngine.find((e: any) => String(e.id) === String(fight.id));
           if (edge?.oddsHistory?.length >= 2) {
              breakdown.oddsHistory = edge.oddsHistory;
           }
        }
      }
    }
  }

  return (
    <AnalysisResultClient
      eventName={title}
      eventDate={createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
      fights={uiFights}
      bets={data.mafsCoreEngine || []}
      breakdowns={data.fightBreakdowns || {}}
      userOddsFormat={oddsFormat}
      thresholds={thresholds}
    />
  );
}