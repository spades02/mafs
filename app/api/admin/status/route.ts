import { NextRequest, NextResponse } from "next/server";
import { count, desc, eq, gt, or } from "drizzle-orm";
import { auth } from "@/app/lib/auth/auth";
import { headers } from "next/headers";
import {
  db,
  events,
  weeklyRuns,
  calibrationConfigs,
  predictionOutcomes,
} from "@/db";

export const runtime = "nodejs";

const RECALIBRATE_MIN_SAMPLE = 100;

/**
 * Admin-only status snapshot: where the weekly-sim pipeline is for the next
 * event, when recalibration last ran, and whether enough graded predictions
 * exist for the next Sunday recalibration cron to actually adjust anything.
 *
 * Auth: same admin gate as /api/admin/weekly-sim-smoke — session user id must
 * be in MAFS_ADMIN_USER_IDS (comma-separated).
 *
 * Usage:
 *   GET /api/admin/status
 */
export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminIds = (process.env.MAFS_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!adminIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden — not an admin" }, { status: 403 });
  }

  const now = new Date();

  // 1. Next upcoming event
  const [nextEvent] = await db
    .select()
    .from(events)
    .where(gt(events.dateTime, now))
    .orderBy(events.dateTime)
    .limit(1);

  // 2. Active or most recent weekly run for that event
  let currentRun: typeof weeklyRuns.$inferSelect | undefined;
  if (nextEvent) {
    const [run] = await db
      .select()
      .from(weeklyRuns)
      .where(eq(weeklyRuns.eventId, nextEvent.eventId))
      .orderBy(desc(weeklyRuns.startedAt))
      .limit(1);
    currentRun = run;
  }

  // 3. Last calibration config (active first, falling back to most recent version)
  const [latestConfig] = await db
    .select()
    .from(calibrationConfigs)
    .orderBy(desc(calibrationConfigs.version))
    .limit(1);

  // 4. Graded prediction counts — total rows and rows that would feed the
  // recalibrator (outcome ∈ {win, loss}).
  const [totalRow] = await db.select({ n: count() }).from(predictionOutcomes);
  const [actionableRow] = await db
    .select({ n: count() })
    .from(predictionOutcomes)
    .where(
      or(eq(predictionOutcomes.outcome, "win"), eq(predictionOutcomes.outcome, "loss")),
    );

  const totalGraded = Number(totalRow?.n ?? 0);
  const actionableGraded = Number(actionableRow?.n ?? 0);

  // 5. Recent recalibration history (last 5 versions) for trend visibility
  const recentConfigs = await db
    .select({
      version: calibrationConfigs.version,
      computedAt: calibrationConfigs.computedAt,
      sampleSize: calibrationConfigs.sampleSize,
      calibrationScore: calibrationConfigs.calibrationScore,
      isActive: calibrationConfigs.isActive,
    })
    .from(calibrationConfigs)
    .orderBy(desc(calibrationConfigs.version))
    .limit(5);

  return NextResponse.json({
    now: now.toISOString(),
    nextEvent: nextEvent
      ? {
          eventId: nextEvent.eventId,
          name: nextEvent.name,
          dateTime: nextEvent.dateTime,
        }
      : null,
    currentRun: currentRun
      ? {
          id: currentRun.id,
          status: currentRun.status,
          startedAt: currentRun.startedAt,
          completedAt: currentRun.completedAt,
          tickCount: currentRun.tickCount,
          totalFightsSimulated: currentRun.totalFightsSimulated,
          targetSims: currentRun.targetSims,
          totalCostUsd: currentRun.totalCostUsd,
          progressPct:
            currentRun.targetSims > 0
              ? Math.round((currentRun.totalFightsSimulated / currentRun.targetSims) * 100)
              : null,
        }
      : null,
    recalibration: {
      latest: latestConfig
        ? {
            version: latestConfig.version,
            isActive: latestConfig.isActive,
            computedAt: latestConfig.computedAt,
            sampleSize: latestConfig.sampleSize,
            calibrationScore: latestConfig.calibrationScore,
            notes: latestConfig.notes,
          }
        : null,
      recent: recentConfigs,
      gradedPredictions: {
        total: totalGraded,
        actionable: actionableGraded,
        minSampleNeeded: RECALIBRATE_MIN_SAMPLE,
        canRecalibrateNow: actionableGraded >= RECALIBRATE_MIN_SAMPLE,
      },
    },
  });
}
