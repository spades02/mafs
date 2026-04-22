import { pgTable, text, timestamp, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const calibrationConfigs = pgTable("calibration_configs", {
  id: text("id").primaryKey(),
  version: integer("version").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  minModelProb: real("min_model_prob").notNull().default(0.55),
  minEdgePct: real("min_edge_pct").notNull().default(0.5),
  minAgentConsensus: real("min_agent_consensus").notNull().default(0.6),
  highVarConfFloor: real("high_var_conf_floor").notNull().default(0.55),
  marketEdgeThresholds: jsonb("market_edge_thresholds")
    .$type<Record<string, number>>()
    .default({}),
  confidenceScaling: jsonb("confidence_scaling")
    .$type<{ multiplier: number; clampMin: number; clampMax: number }>()
    .default({ multiplier: 1.0, clampMin: 30, clampMax: 95 }),
  variancePenalties: jsonb("variance_penalties")
    .$type<Record<string, number>>()
    .default({ high: 0, medium: 0, low: 0 }),
  agentSignalWeights: jsonb("agent_signal_weights")
    .$type<Record<string, number>>()
    .default({}),
  sampleSize: integer("sample_size").default(0),
  calibrationScore: real("calibration_score"),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  notes: text("notes"),
});
