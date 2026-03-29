import { pgTable, text, timestamp, real, integer } from "drizzle-orm/pg-core";
import { predictionLogs } from "./prediction-logs-schema";
import { fightSettlements } from "./fight-settlements-schema";

export const predictionOutcomes = pgTable("prediction_outcomes", {
  id: text("id").primaryKey(),
  predictionLogId: text("prediction_log_id")
    .notNull()
    .unique()
    .references(() => predictionLogs.id, { onDelete: "cascade" }),
  fightSettlementId: text("fight_settlement_id")
    .notNull()
    .references(() => fightSettlements.id),
  outcome: text("outcome").notNull(),
  closingOdds: integer("closing_odds"),
  closingProb: real("closing_prob"),
  clv: real("clv"),
  profitUnits: real("profit_units"),
  gradedAt: timestamp("graded_at").defaultNow().notNull(),
});
