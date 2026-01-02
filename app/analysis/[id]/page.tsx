// app/(dashboard)/analysis/[id]/page.tsx
import { db } from "@/db";
import { analysisRun } from "@/db/schema";
import { requireAuth } from "@/app/lib/auth/require-auth";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import BestBets from "@/components/best-bets";
import FightAnalysis from "@/components/pages/home/fight-analysis";
import AllMarketEdges from "@/components/all-market-edges";

// 1. Define the shape of your JSON column for type safety
interface AnalysisResult {
  mafsCoreEngine: any[]; 
  fightBreakdowns: any[];
}

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  if (!session?.user?.id) notFound();

  // 2. Properly await params (Next.js 15 requirement)
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

  const { title, result, createdAt } = run[0];
  
  // 3. Cast the JSON result to our interface
  const data = result as unknown as AnalysisResult;

  return (
    <div className="max-w-6xl mx-auto space-y-6 my-12">
      <header>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {createdAt.toLocaleString()}
        </p>
      </header>

      <BestBets fightData={data.mafsCoreEngine} />
      
      {/* FIX: Pass the 'fightBreakdowns' ARRAY directly. 
         Do not convert to a Map/Record with Object.fromEntries, 
         or <FightAnalysis> will crash when it tries to .map() over it.
      */}
      <FightAnalysis 
        fightData={data.mafsCoreEngine} 
        fightBreakdowns={data.fightBreakdowns} 
      />
      
      <AllMarketEdges fightData={data.mafsCoreEngine} />
    </div>
  );
}