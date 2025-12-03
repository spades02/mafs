export * from './client';
export * from './schema';

// Optional: Export types for table inference
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from './schema';

// Inferred types for all tables
export type FighterProfile = InferSelectModel<typeof schema.fighterProfiles>;
export type NewFighterProfile = InferInsertModel<typeof schema.fighterProfiles>;

export type Fight = InferSelectModel<typeof schema.fights>;
export type NewFight = InferInsertModel<typeof schema.fights>;

export type RoundStat = InferSelectModel<typeof schema.roundStats>;
export type NewRoundStat = InferInsertModel<typeof schema.roundStats>;

export type RoundNarrative = InferSelectModel<typeof schema.roundNarratives>;
export type NewRoundNarrative = InferInsertModel<typeof schema.roundNarratives>;

export type FighterNews = InferSelectModel<typeof schema.fighterNews>;
export type NewFighterNews = InferInsertModel<typeof schema.fighterNews>;

export type FightMarket = InferSelectModel<typeof schema.fightMarkets>;
export type NewFightMarket = InferInsertModel<typeof schema.fightMarkets>;

export type AgentOutput = InferSelectModel<typeof schema.agentOutputs>;
export type NewAgentOutput = InferInsertModel<typeof schema.agentOutputs>;

export type FinalPrediction = InferSelectModel<typeof schema.finalPredictions>;
export type NewFinalPrediction = InferInsertModel<typeof schema.finalPredictions>;
