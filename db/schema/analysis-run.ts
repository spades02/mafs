import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { FightBreakdownType } from "../../types/fight-breakdowns";
import { FightEdgeSummary } from "../../lib/agents/schemas/fight-edge-summary-schema";


export const analysisRun = pgTable("analysis_runs", {
  id: text("id").primaryKey(),
  
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

    title: text("title").notNull(), // ← EVENT NAME

  eventId: text("event_id"), // optional but useful later
  result: jsonb("result")
    .$type<{
      mafsCoreEngine: FightEdgeSummary[];
      fightBreakdowns: FightBreakdownType[];
    }>()
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
