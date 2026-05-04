import Link from "next/link";
import { eq, and, sql } from "drizzle-orm";
import { db, recurringEdges, user } from "@/db";
import { verifyFreePickToken } from "@/lib/retention/token";

// This is a public page — anyone with a valid HMAC token can view it.
// We deliberately don't gate on session, so users can read their pick
// from email without re-logging-in.

export default async function FreePickPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = verifyFreePickToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Link expired or invalid</h1>
          <p className="text-muted-foreground">
            This free-pick link is either expired or has been tampered with. Open the latest weekly
            email or sign in to MAFS for the current card.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded bg-primary text-black font-semibold"
          >
            Open MAFS
          </Link>
        </div>
      </div>
    );
  }

  const [edge] = await db
    .select()
    .from(recurringEdges)
    .where(
      and(
        eq(recurringEdges.eventId, payload.eid),
        eq(recurringEdges.fightId, payload.fid),
        eq(recurringEdges.betType, payload.bt),
        eq(recurringEdges.label, payload.lbl),
      ),
    )
    .limit(1);

  // Mark this user's weekly pick as claimed (best-effort).
  if (payload.uid) {
    await db
      .update(user)
      .set({ weeklyFreePickUsedAt: sql`now()` })
      .where(eq(user.id, payload.uid))
      .catch(() => {});
  }

  if (!edge) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">This week's pick has rolled over</h1>
          <p className="text-muted-foreground">
            The pick referenced by this link is no longer in this week's recurring-edge feed.
            Open MAFS to see the live card.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded bg-primary text-black font-semibold"
          >
            Open MAFS
          </Link>
        </div>
      </div>
    );
  }

  const appearancePct = Math.round(edge.appearancePct * 100);
  const avgEdgeStr = `${edge.avgEdge >= 0 ? "+" : ""}${edge.avgEdge.toFixed(1)}%`;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-xl space-y-6">
        <header className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            Your free MAFS pick
          </p>
          <h1 className="text-3xl font-bold text-white">{edge.label}</h1>
          <p className="text-sm text-muted-foreground">
            One of this week's strongest recurring edges across our weekly simulation runs.
          </p>
        </header>

        <div className="rounded-xl border border-primary/20 bg-[#0F1117] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{appearancePct}%</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
                Sim frequency
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">{avgEdgeStr}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
                Avg edge
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <span className="text-muted-foreground/60">Bet type:</span>{" "}
              <span className="text-white">{edge.betType}</span>
            </div>
            {edge.weightClass && (
              <div>
                <span className="text-muted-foreground/60">Weight class:</span>{" "}
                <span className="text-white">{edge.weightClass}</span>
              </div>
            )}
            {edge.latestMarketOdd != null && (
              <div>
                <span className="text-muted-foreground/60">Latest market:</span>{" "}
                <span className="text-white font-mono">
                  {edge.latestMarketOdd > 0 ? `+${edge.latestMarketOdd}` : edge.latestMarketOdd}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            This is one pick from this week's full MAFS card. Pro unlocks the rest.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded bg-primary text-black font-bold"
          >
            See the full card
          </Link>
        </div>
      </div>
    </div>
  );
}
