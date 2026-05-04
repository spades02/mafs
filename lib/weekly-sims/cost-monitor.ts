import { nanoid } from "nanoid";
import { db, llmSpendLog } from "@/db";
import { gte, sql } from "drizzle-orm";

export type SpendEntry = {
  source: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  weeklyRunId?: string;
};

/**
 * OpenAI pricing as of 2026-05. Update when provider pricing changes.
 * gpt-4o:        $2.50 / M input  | $10.00 / M output
 * gpt-4o-mini:   $0.15 / M input  | $0.60  / M output
 */
export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  switch (model) {
    case "gpt-4o":
      return (inputTokens * 2.5) / 1_000_000 + (outputTokens * 10) / 1_000_000;
    case "gpt-4o-mini":
      return (inputTokens * 0.15) / 1_000_000 + (outputTokens * 0.6) / 1_000_000;
    default:
      return 0;
  }
}

export async function logLlmSpend(entry: SpendEntry): Promise<void> {
  await db.insert(llmSpendLog).values({
    id: nanoid(),
    source: entry.source,
    model: entry.model,
    inputTokens: entry.inputTokens,
    outputTokens: entry.outputTokens,
    costUsd: entry.costUsd,
    weeklyRunId: entry.weeklyRunId,
  });
}

/**
 * Returns total LLM spend (USD) over the last N days.
 * Used by the daily cost-alert cron in Phase 2.4.
 */
export async function rollingSpend(days: number): Promise<number> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${llmSpendLog.costUsd}), 0)::float` })
    .from(llmSpendLog)
    .where(gte(llmSpendLog.createdAt, since));
  return row?.total ?? 0;
}
