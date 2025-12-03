import { index, pgTable } from "drizzle-orm/pg-core";
import { fights } from "./fights";
import { fighterProfiles } from "./fighter-profiles";

// 8️⃣ Final Predictions
export const finalPredictions = pgTable('final_predictions', (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    
    createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    
    fightId: t.uuid('fight_id').notNull().references(() => fights.id, { onDelete: 'cascade' }),
    
    modelVersion: t.text('model_version'),
    
    predictedWinnerFighterId: t.uuid('predicted_winner_fighter_id').references(() => fighterProfiles.id, { onDelete: 'set null' }),
    
    confidencePct: t.numeric('confidence_pct'),
    
    probWinA: t.numeric('prob_win_a'),
    probWinB: t.numeric('prob_win_b'),
    probDraw: t.numeric('prob_draw'),
    
    koProbA: t.numeric('ko_prob_a'),
    subProbA: t.numeric('sub_prob_a'),
    decProbA: t.numeric('dec_prob_a'),
    
    koProbB: t.numeric('ko_prob_b'),
    subProbB: t.numeric('sub_prob_b'),
    decProbB: t.numeric('dec_prob_b'),
    
    riskScore: t.numeric('risk_score'),
    
    expectedValueMainMarket: t.numeric('expected_value_main_market'),
    
    recommendedBetSide: t.text('recommended_bet_side', { enum: ['A', 'B', 'pass'] }),
    recommendedBetSizeUnits: t.numeric('recommended_bet_size_units'),
    
    bettingEdges: t.jsonb('betting_edges'),
    redFlags: t.jsonb('red_flags'),
    
    modelExplanation: t.text('model_explanation'),
    featureImportance: t.jsonb('feature_importance'),
    
    meta: t.jsonb('meta'),
  }), (table) => [
    index('final_predictions_idx').on(table.fightId, table.createdAt),
  ]);