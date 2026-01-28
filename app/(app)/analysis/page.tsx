import { db } from "@/db";
import { analysisRun } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/app/lib/auth/require-auth"
import { AnalysisHistoryList } from "@/components/pages/analysis/analysis-history-list";

export default async function AnalysisPage() {
  const session = await requireAuth()

  if (!session?.user?.id) return null;

  const runs = await db
    .select({
      id: analysisRun.id,
      title: analysisRun.title,
      createdAt: analysisRun.createdAt,
      result: analysisRun.result
    })
    .from(analysisRun)
    .where(eq(analysisRun.userId, session.user.id))
    .orderBy(desc(analysisRun.createdAt));

  const summary = runs.map(run => {
    const result = run.result as any;
    const bets = result.mafsCoreEngine || [];
    const betCount = bets.length;

    // Find top bet (highest edge)
    const topBetObj = bets.length > 0 ? bets.reduce((prev: any, current: any) => {
      const currentEdge = current?.edge_pct || -100;
      const prevEdge = prev?.edge_pct || -100;
      return (currentEdge > prevEdge) ? current : prev
    }) : null;

    const topBet = topBetObj ? topBetObj.label : undefined;

    return {
      id: run.id,
      title: run.title,
      createdAt: run.createdAt,
      betCount,
      topBet
    }
  });

  return <AnalysisHistoryList runs={summary} />;
}
