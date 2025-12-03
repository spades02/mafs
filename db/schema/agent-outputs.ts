import { index, pgTable } from "drizzle-orm/pg-core";
import { fights } from "./fights";
import { fighterProfiles } from "./fighter-profiles";

// 7️⃣ Agent Outputs
export const agentOutputs = pgTable('agent_outputs', (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    
    createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    
    fightId: t.uuid('fight_id').notNull().references(() => fights.id, { onDelete: 'cascade' }),
    fighterId: t.uuid('fighter_id').references(() => fighterProfiles.id, { onDelete: 'set null' }),
    
    agentType: t.text('agent_type', { enum: ['TAPE', 'STATS', 'NEWS', 'STYLE', 'MARKET', 'JUDGE', 'RISK', 'CONSISTENCY', 'OTHER'] }),
    
    signalStrength: t.numeric('signal_strength'),
    confidence: t.numeric('confidence'),
    
    numericFeatures: t.jsonb('numeric_features'),
    categoricalFlags: t.jsonb('categorical_flags'),
    
    notes: t.text('notes'),
    
    version: t.text('version'),
    
    rawOutput: t.jsonb('raw_output'),
    meta: t.jsonb('meta'),
  }), (table) => [
    index('agent_outputs_idx').on(table.fightId, table.agentType),
  ]);