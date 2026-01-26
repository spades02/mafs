import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { events } from "./events-schema";

export const fights = pgTable("fights", {
    id: text("id").primaryKey(),
    eventId: text("event_id").references(() => events.eventId),
    fighterAId: text("fighter_a_id"),
    fighterBId: text("fighter_b_id"),
    winnerId: text("winner_id"),
    method: text("method"),
    round: integer("round"),
    time: text("time"),
    weightClass: text("weight_class"),
});
