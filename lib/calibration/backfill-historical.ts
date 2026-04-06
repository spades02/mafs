import { db } from "@/db";
import {
  fights,
  events,
  fighters,
  predictionLogs,
  fightSettlements,
  predictionOutcomes,
  mmaOddsData,
  historicalOdds,
} from "@/db/schema";
import { eq, isNotNull, inArray, ilike, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { buildMafsEventInput } from "@/lib/mafs/fetchFighterStats";
import { resolveLiveOdds } from "@/lib/odds/resolve-live-odds";
import { analyzeFight } from "@/app/ai/agents/agents";
import { logPredictions } from "@/lib/calibration/log-predictions";
import { getActiveCalibrationConfig } from "@/lib/calibration/get-active-config";
import {
  determineOutcome,
  computeClosingOdds,
  computeProfitUnits,
} from "@/lib/calibration/grade-prediction";
import { oddsToProb } from "@/lib/odds/utils";
import type { SimplifiedFight } from "@/app/ai/agents/agents";

export type BackfillStats = {
  processed: number;
  skipped: number;
  graded: number;
  errors: string[];
};

function computeWentDistance(method: string | null): boolean | null {
  if (!method) return null;
  return method.toLowerCase().includes("decision");
}

/**
 * Pulls the closing-line moneyline for a fighter in a specific fight from
 * historical_odds. Uses the most recent timestamp as the "closing" line.
 */
async function getHistoricalMoneyline(
  fightId: string,
  fighterId: string
): Promise<number | null> {
  const [row] = await db
    .select({ ml: historicalOdds.moneyline })
    .from(historicalOdds)
    .where(
      and(
        eq(historicalOdds.fightId, fightId),
        eq(historicalOdds.fighterId, fighterId),
        isNotNull(historicalOdds.moneyline)
      )
    )
    .orderBy(desc(historicalOdds.timestamp))
    .limit(1);

  return row?.ml ?? null;
}

async function getClosingOddsForFighter(fighterId: string): Promise<number | null> {
  const [fighter] = await db
    .select({ firstName: fighters.firstName, lastName: fighters.lastName })
    .from(fighters)
    .where(eq(fighters.id, fighterId))
    .limit(1);

  if (!fighter) return null;

  const lastName = fighter.lastName || fighter.firstName || "";
  if (!lastName) return null;

  const [oddsRow] = await db
    .select({ ml: mmaOddsData.moneylineOdds })
    .from(mmaOddsData)
    .where(ilike(mmaOddsData.fighter, `%${lastName}%`))
    .limit(1);

  return oddsRow?.ml != null ? oddsRow.ml : null;
}

export async function runHistoricalBackfill(
  limit = 50,
  offset = 0
): Promise<BackfillStats> {
  const stats: BackfillStats = { processed: 0, skipped: 0, graded: 0, errors: [] };

  // 1. Query completed fights with event data
  const completedFights = await db
    .select({
      fightId: fights.id,
      eventId: fights.eventId,
      fighterAId: fights.fighterAId,
      fighterBId: fights.fighterBId,
      winnerId: fights.winnerId,
      method: fights.method,
      round: fights.round,
      weightClass: fights.weightClass,
      eventName: events.name,
    })
    .from(fights)
    .innerJoin(events, eq(fights.eventId, events.eventId))
    .where(isNotNull(fights.winnerId))
    .orderBy(events.dateTime)
    .limit(limit)
    .offset(offset);

  if (completedFights.length === 0) return stats;

  // 2. Find already-logged fights (skip them)
  const fightIds = completedFights.map((f) => f.fightId);
  const alreadyLogged = await db
    .selectDistinct({ fightId: predictionLogs.fightId })
    .from(predictionLogs)
    .where(inArray(predictionLogs.fightId, fightIds));

  const loggedSet = new Set(alreadyLogged.map((r) => r.fightId));
  const toProcess = completedFights.filter((f) => !loggedSet.has(f.fightId));

  stats.skipped = completedFights.length - toProcess.length;

  if (toProcess.length === 0) return stats;

  // 3. Batch-fetch fighter names
  const allFighterIds = [
    ...new Set(
      toProcess.flatMap((f) => [f.fighterAId, f.fighterBId].filter(Boolean) as string[])
    ),
  ];

  const fighterRows = await db
    .select({ id: fighters.id, firstName: fighters.firstName, lastName: fighters.lastName })
    .from(fighters)
    .where(inArray(fighters.id, allFighterIds));

  const fighterMap = new Map(
    fighterRows.map((f) => [f.id, `${f.firstName ?? ""} ${f.lastName ?? ""}`.trim()])
  );

  // 4. Batch-fetch fighter stats
  const eventFighters = allFighterIds.map((id) => ({
    id,
    name: fighterMap.get(id) ?? "",
  }));
  const mafsInput = await buildMafsEventInput(eventFighters);

  // 5. Load calibration config once
  const calibrationConfig = await getActiveCalibrationConfig();

  // 6. Process each fight sequentially
  for (const fight of toProcess) {
    try {
      const nameA = fighterMap.get(fight.fighterAId ?? "") ?? "Fighter A";
      const nameB = fighterMap.get(fight.fighterBId ?? "") ?? "Fighter B";
      const matchup = `${nameA} vs ${nameB}`;

      // 1. Try historical_odds first (per-fight closing moneylines, no leakage)
      const mlA = fight.fighterAId
        ? await getHistoricalMoneyline(fight.fightId, fight.fighterAId)
        : null;
      const mlB = fight.fighterBId
        ? await getHistoricalMoneyline(fight.fightId, fight.fighterBId)
        : null;

      let moneylines: [number, number] | null =
        mlA != null && mlB != null ? [mlA, mlB] : null;
      let fullOdds: SimplifiedFight["fullOdds"] = undefined;

      // 2. Fall back to mmaOddsData (props snapshot) for richer market data
      if (!moneylines) {
        const oddsResult = await resolveLiveOdds(matchup);
        if (oddsResult.odds) {
          moneylines = oddsResult.odds;
        }
        if (oddsResult.fighterA || oddsResult.fighterB) {
          fullOdds = { a: oddsResult.fighterA, b: oddsResult.fighterB };
        }
      }

      // 3. Skip fight entirely if no odds available — saves OpenAI tokens and
      //    avoids polluting calibration with "No Bet" rows.
      if (!moneylines && !fullOdds) {
        stats.skipped++;
        continue;
      }

      const oddsSource: "api" | "no_match" = "api";

      const simplifiedFight: SimplifiedFight = {
        id: fight.fightId,
        matchup,
        fighterIds: [fight.fighterAId!, fight.fighterBId!],
        moneylines,
        fullOdds,
      };

      // Run Agent 1 only (no breakdown writer — not needed for calibration)
      const { edge } = await analyzeFight(
        simplifiedFight,
        fight.eventName ?? "",
        mafsInput.fighters,
        calibrationConfig
      );

      const fightResult = {
        type: "fight" as const,
        fightId: fight.fightId,
        edge,
        breakdown: {} as never,
        oddsSource,
      };

      // Log prediction with source="backfill" and no analysisRunId
      await logPredictions(null, fight.eventId ?? "", [fightResult], "backfill");

      // Create fightSettlement from DB data (idempotent)
      const [existingSettlement] = await db
        .select()
        .from(fightSettlements)
        .where(eq(fightSettlements.fightId, fight.fightId))
        .limit(1);

      let settlementId: string;
      let settlement: typeof existingSettlement;

      if (existingSettlement) {
        settlementId = existingSettlement.id;
        settlement = existingSettlement;
      } else {
        settlementId = nanoid();
        // Prefer historical_odds (per-fight closing) over mmaOddsData (current snapshot)
        const closingOddsA =
          mlA ??
          (fight.fighterAId ? await getClosingOddsForFighter(fight.fighterAId) : null);
        const closingOddsB =
          mlB ??
          (fight.fighterBId ? await getClosingOddsForFighter(fight.fighterBId) : null);

        const newSettlement = {
          id: settlementId,
          fightId: fight.fightId,
          eventId: fight.eventId,
          winnerId: fight.winnerId,
          method: fight.method,
          round: fight.round,
          wentDistance: computeWentDistance(fight.method),
          closingOddsA,
          closingOddsB,
          dataSource: "backfill_db",
        };

        await db.insert(fightSettlements).values(newSettlement);
        settlement = { ...newSettlement, settledAt: new Date() };
      }

      // Fetch the predictionLog row we just inserted
      const [newLog] = await db
        .select()
        .from(predictionLogs)
        .where(
          and(
            eq(predictionLogs.fightId, fight.fightId),
            eq(predictionLogs.source, "backfill")
          )
        )
        .orderBy(predictionLogs.createdAt)
        .limit(1);

      if (!newLog) {
        stats.errors.push(`${fight.fightId}: prediction log not found after insert`);
        stats.processed++;
        continue;
      }

      const fightRecord = {
        fighterAId: fight.fighterAId,
        fighterBId: fight.fighterBId,
      };

      const outcome = determineOutcome(newLog, settlement, fightRecord);
      const closingOdds = computeClosingOdds(newLog, settlement, fightRecord);
      const closingProb = closingOdds != null ? oddsToProb(closingOdds) : null;
      const clv =
        closingProb != null ? newLog.modelProb - closingProb : null;
      const profitUnits = computeProfitUnits(
        outcome,
        closingOdds ?? newLog.oddsAmerican
      );

      await db.insert(predictionOutcomes).values({
        id: nanoid(),
        predictionLogId: newLog.id,
        fightSettlementId: settlementId,
        outcome,
        closingOdds,
        closingProb,
        clv,
        profitUnits,
      });

      stats.processed++;
      stats.graded++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stats.errors.push(`${fight.fightId}: ${msg}`);
      stats.processed++;
    }
  }

  return stats;
}
