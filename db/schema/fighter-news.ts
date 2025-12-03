import { index, pgTable } from "drizzle-orm/pg-core";
import { fighterProfiles } from "./fighter-profiles";
import { fights } from "./fights";

// 5️⃣ Fighter News
export const fighterNews = pgTable('fighter_news', (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    
    createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    
    fighterId: t.uuid('fighter_id').notNull().references(() => fighterProfiles.id, { onDelete: 'cascade' }),
    relatedFightId: t.uuid('related_fight_id').references(() => fights.id, { onDelete: 'set null' }),
    
    newsDate: t.date('news_date'),
    
    sourceName: t.text('source_name'),
    sourceUrl: t.text('source_url'),
    sourceType: t.text('source_type', { enum: ['official', 'journalist', 'fighter', 'coach', 'rumor', 'social_media'] }),
    
    injuryNotes: t.text('injury_notes'),
    injurySeverity: t.text('injury_severity', { enum: ['minor', 'moderate', 'severe', 'unknown'] }),
    
    campChange: t.boolean('camp_change'),
    campChangeDetails: t.text('camp_change_details'),
    
    weightCutIssue: t.boolean('weight_cut_issue'),
    weightCutDetails: t.text('weight_cut_details'),
    
    shortNoticeFlag: t.boolean('short_notice_flag'),
    
    illnessReported: t.boolean('illness_reported'),
    illnessDetails: t.text('illness_details'),
    
    pulloutsOrReschedules: t.text('pullouts_or_reschedules'),
    
    pressConferenceQuotes: t.text('press_conference_quotes'),
    
    redFlagIndicators: t.text('red_flag_indicators').array(),
    
    sentimentScore: t.numeric('sentiment_score'),
    sentimentLabel: t.text('sentiment_label', { enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'] }),
    
    sourceCredibilityScore: t.numeric('source_credibility_score'),
    
    appliesToFighterSide: t.text('applies_to_fighter_side', { enum: ['A', 'B', 'both', 'unknown'] }),
    
    mlFeatures: t.jsonb('ml_features'),
  }), (table) => [
    index('fighter_news_idx').on(table.fighterId, table.newsDate),
  ]);