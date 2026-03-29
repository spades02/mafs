import { pgTable, text, timestamp, real, integer, jsonb } from "drizzle-orm/pg-core";
import { analysisRun } from "./analysis-run";

export const predictionLogs = pgTable("prediction_logs", {
  id: text("id").primaryKey(),
  analysisRunId: text("analysis_run_id")
    .notNull()
    .references(() => analysisRun.id, { onDelete: "cascade" }),
  eventId: text("event_id"),
  fightId: text("fight_id"),
  fighterId: text("fighter_id"),
  betType: text("bet_type").notNull(),
  label: text("label").notNull(),
  modelProb: real("model_prob").notNull(),
  marketProb: real("market_prob"),
  edgePct: real("edge_pct"),
  confidencePct: real("confidence_pct"),
  stabilityScore: real("stability_score"),
  varianceTag: text("variance_tag"),
  oddsAmerican: integer("odds_american"),
  status: text("status"),
  agentSignals: jsonb("agent_signals"),
  marketEvals: jsonb("market_evals"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
