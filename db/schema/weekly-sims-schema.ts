import { pgTable, text, timestamp, integer, real, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { events } from "./events-schema";

/**
 * One row per scheduled weekly run for an event.
 * `status` lifecycle: pending → running → completed | failed.
 * `tick_count` increments each time the cron fires for this run.
 */
export const weeklyRuns = pgTable(
  "weekly_runs",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.eventId, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    status: text("status").notNull().default("running"),
    targetSims: integer("target_sims").notNull().default(500),
    tickCount: integer("tick_count").notNull().default(0),
    totalFightsSimulated: integer("total_fights_simulated").notNull().default(0),
    totalCostUsd: real("total_cost_usd").notNull().default(0),
  },
  (table) => [index("weekly_runs_event_idx").on(table.eventId)],
);

/**
 * One row per (cron tick, fight, bet_type, label).
 * Together these are the raw sample population from which `recurring_edges`
 * is computed. We deliberately do NOT collapse here — keeping each tick as
 * its own row preserves the line-movement story (model prob at tick 1 vs 5).
 */
export const weeklySimulationResults = pgTable(
  "weekly_simulation_results",
  {
    id: text("id").primaryKey(),
    weeklyRunId: text("weekly_run_id")
      .notNull()
      .references(() => weeklyRuns.id, { onDelete: "cascade" }),
    fightId: text("fight_id").notNull(),
    betType: text("bet_type").notNull(), // "ML" | "ITD" | "GTD" | "DGTD" | "Over" | "Under" | "MOV" | "Round"
    label: text("label").notNull(), // e.g. "Chimaev ML", "Over 2.5 Rounds"
    modelProb: real("model_prob").notNull(),
    marketImplied: real("market_implied"), // null when prop has no live line
    edgePct: real("edge_pct"), // null when no real market — same fix as agents.ts
    ev: real("ev"),
    marketOddAtRun: integer("market_odd_at_run"), // signed American odds, null if missing
    weightClass: text("weight_class"),
    isReusedFromPrior: boolean("is_reused_from_prior").notNull().default(false), // true when odds didn't move >3% so we counted prior result
    simulatedAt: timestamp("simulated_at").defaultNow().notNull(),
    tickIndex: integer("tick_index").notNull().default(0),
  },
  (table) => [
    index("wsr_run_idx").on(table.weeklyRunId),
    index("wsr_fight_label_idx").on(table.fightId, table.betType, table.label),
  ],
);

/**
 * Materialized aggregation of weeklySimulationResults, refreshed each tick.
 * Powers the AI Betting Cards (Phase 3) and Retention emails (Phase 4).
 *
 * `appearance_pct = appearances / total_runs`. `appearance_pct` is the
 * primary tier-classification number per the strategy doc.
 */
export const recurringEdges = pgTable(
  "recurring_edges",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.eventId, { onDelete: "cascade" }),
    fightId: text("fight_id").notNull(),
    betType: text("bet_type").notNull(),
    label: text("label").notNull(),
    appearances: integer("appearances").notNull().default(0),
    totalRuns: integer("total_runs").notNull().default(0),
    appearancePct: real("appearance_pct").notNull().default(0),
    avgEdge: real("avg_edge").notNull().default(0),
    medianEdge: real("median_edge").notNull().default(0),
    edgeStability: real("edge_stability").notNull().default(0), // stddev of edge across runs
    avgModelProb: real("avg_model_prob").notNull().default(0),
    latestMarketOdd: integer("latest_market_odd"),
    weightClass: text("weight_class"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("recurring_edges_event_idx").on(table.eventId),
    index("recurring_edges_appearance_idx").on(table.appearancePct),
  ],
);

/**
 * Cost log for weekly sim infra. One row per cron tick. The daily cost-alert
 * cron sums the last 7 days and emails an admin if total > soft target.
 */
export const llmSpendLog = pgTable(
  "llm_spend_log",
  {
    id: text("id").primaryKey(),
    source: text("source").notNull(), // "weekly-cron" | "user-sim" | etc
    model: text("model").notNull(), // "gpt-4o" | "gpt-4o-mini"
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    costUsd: real("cost_usd").notNull().default(0),
    weeklyRunId: text("weekly_run_id"), // soft FK — may be null for user-triggered sims
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("llm_spend_log_created_idx").on(table.createdAt)],
);

/**
 * Generated weekly cards per risk model (Phase 3).
 * One row per (event_id, risk_model). Idempotent — rebuild overwrites.
 */
export const weeklyCards = pgTable(
  "weekly_cards",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.eventId, { onDelete: "cascade" }),
    riskModel: text("risk_model").notNull(), // "conservative" | "balanced" | "aggressive" | "professional"
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    cardJson: jsonb("card_json").notNull(),
  },
  (table) => [
    index("weekly_cards_event_model_idx").on(table.eventId, table.riskModel),
  ],
);
