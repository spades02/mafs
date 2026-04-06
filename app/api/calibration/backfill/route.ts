import { NextResponse } from "next/server";
import { runHistoricalBackfill } from "@/lib/calibration/backfill-historical";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit ?? 50), 100);
    const offset = Number(body.offset ?? 0);

    const stats = await runHistoricalBackfill(limit, offset);
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    console.error("[Backfill] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backfill failed" },
      { status: 500 }
    );
  }
}
