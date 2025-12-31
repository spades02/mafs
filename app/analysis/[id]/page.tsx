// app/(dashboard)/analysis/[id]/page.tsx
import { db } from "@/db";
import { analysisRun } from "@/db/schema";
import { requireAuth } from "@/app/lib/auth/require-auth";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import BestBets from "@/components/best-bets";
import FightAnalysis from "@/components/pages/home/fight-analysis";
import AllMarketEdges from "@/components/all-market-edges";

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id?: string | string[] }>;
}) {
  const session = await requireAuth();
  if (!session?.user?.id) notFound();

  const resolvedParams = await params;
const id = Array.isArray(resolvedParams.id)
  ? resolvedParams.id[0]
  : resolvedParams.id;

if (!id) notFound();

console.log("PARARMS:", params)

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

  const { title, result, createdAt } = run[0];
  const fightBreakdownsMap = Object.fromEntries(
    result.fightBreakdowns.map((b) => [b.id, b])
  );  

  return (
    <div className="max-w-6xl mx-auto space-y-6 my-12">
      <header>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {createdAt.toLocaleString()}
        </p>
      </header>

      {/* Render however you already render analysis */}
      <BestBets fightData={result.mafsCoreEngine}/>
      <FightAnalysis fightData={result.mafsCoreEngine} fightBreakdowns={fightBreakdownsMap} />
      <AllMarketEdges fightData={result.mafsCoreEngine}/>
    </div>
  );
}
