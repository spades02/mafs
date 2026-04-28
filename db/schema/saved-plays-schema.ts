import { pgTable, text, timestamp, doublePrecision, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const savedPlay = pgTable(
  "saved_plays",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    betId: text("bet_id").notNull(),
    eventId: text("event_id"),
    eventName: text("event_name"),
    fight: text("fight"),
    label: text("label").notNull(),
    betType: text("bet_type").notNull(),
    oddsAmerican: text("odds_american"),

    pSim: doublePrecision("p_sim"),
    pImp: doublePrecision("p_imp"),
    edgePct: doublePrecision("edge_pct"),
    confidencePct: doublePrecision("confidence_pct"),

    isFavorite: boolean("is_favorite").default(false).notNull(),

    // Grading: populated once the underlying fight resolves.
    outcome: text("outcome"),               // 'win' | 'loss' | 'push' | null (pending)
    gradedAt: timestamp("graded_at"),
    fightSettlementId: text("fight_settlement_id"),

    savedAt: timestamp("saved_at").defaultNow().notNull(),
  },
  (t) => ({
    userBetUnique: uniqueIndex("saved_plays_user_bet_uq").on(t.userId, t.betId),
  }),
);

export type SavedPlay = typeof savedPlay.$inferSelect;
export type NewSavedPlay = typeof savedPlay.$inferInsert;
