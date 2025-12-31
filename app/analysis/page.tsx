// app/(dashboard)/analysis/page.tsx
import { db } from "@/db";
import { analysisRun } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { requireAuth } from "@/app/lib/auth/require-auth"

export default async function AnalysisPage() {
  const session = await requireAuth()

  if (!session?.user?.id) return null;

  const runs = await db
    .select({
      id: analysisRun.id,
      title: analysisRun.title,
      createdAt: analysisRun.createdAt,
    })
    .from(analysisRun)
    .where(eq(analysisRun.userId, session.user.id))
    .orderBy(desc(analysisRun.createdAt));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Your Analysis</h1>

      {runs.map((run) => (
        <Link
          key={run.id}
          href={`/analysis/${run.id}`}
          className="block rounded-lg border p-4 hover:bg-muted"
        >
          <div className="font-medium">{run.title}</div>
          <div className="text-sm text-muted-foreground">
            {run.createdAt.toLocaleString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
