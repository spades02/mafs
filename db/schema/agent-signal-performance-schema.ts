import { pgTable, text, timestamp, real, integer } from "drizzle-orm/pg-core";

export const agentSignalPerformance = pgTable("agent_signal_performance", {
  id: text("id").primaryKey(),
  signalName: text("signal_name").notNull(),
  signalValue: text("signal_value").notNull(),
  totalCount: integer("total_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  accuracyRate: real("accuracy_rate"),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
  configVersion: integer("config_version"),
});
