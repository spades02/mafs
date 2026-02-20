import { pgTable, text, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";

export const fighters = pgTable("fighters", {
    id: text("id").primaryKey(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    nickname: text("nickname"),
    stance: text("stance"),
    reachIn: doublePrecision("reach_in"),
    heightIn: doublePrecision("height_in"),
    weightClass: text("weight_class"),
    wins: integer("wins"),
    losses: integer("losses"),
    slpm: doublePrecision("slpm"), // strikes landed per min
    strAcc: doublePrecision("str_acc"), // striking accuracy
    tdAvg: doublePrecision("td_avg"), // takedown average
    subAvg: doublePrecision("sub_avg"), // submission average
    createdAt: timestamp("created_at", { withTimezone: true }),
});
