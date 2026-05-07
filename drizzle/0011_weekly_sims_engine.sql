CREATE TABLE IF NOT EXISTS "weekly_runs" (
  "id" text PRIMARY KEY NOT NULL,
  "event_id" text NOT NULL REFERENCES "events"("event_id") ON DELETE CASCADE,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "status" text DEFAULT 'running' NOT NULL,
  "target_sims" integer DEFAULT 500 NOT NULL,
  "tick_count" integer DEFAULT 0 NOT NULL,
  "total_fights_simulated" integer DEFAULT 0 NOT NULL,
  "total_cost_usd" real DEFAULT 0 NOT NULL
);
CREATE INDEX IF NOT EXISTS "weekly_runs_event_idx" ON "weekly_runs" ("event_id");

CREATE TABLE IF NOT EXISTS "weekly_simulation_results" (
  "id" text PRIMARY KEY NOT NULL,
  "weekly_run_id" text NOT NULL REFERENCES "weekly_runs"("id") ON DELETE CASCADE,
  "fight_id" text NOT NULL,
  "bet_type" text NOT NULL,
  "label" text NOT NULL,
  "model_prob" real NOT NULL,
  "market_implied" real,
  "edge_pct" real,
  "ev" real,
  "market_odd_at_run" integer,
  "weight_class" text,
  "is_reused_from_prior" boolean DEFAULT false NOT NULL,
  "simulated_at" timestamp DEFAULT now() NOT NULL,
  "tick_index" integer DEFAULT 0 NOT NULL
);
CREATE INDEX IF NOT EXISTS "wsr_run_idx" ON "weekly_simulation_results" ("weekly_run_id");
CREATE INDEX IF NOT EXISTS "wsr_fight_label_idx" ON "weekly_simulation_results" ("fight_id", "bet_type", "label");

CREATE TABLE IF NOT EXISTS "recurring_edges" (
  "id" text PRIMARY KEY NOT NULL,
  "event_id" text NOT NULL REFERENCES "events"("event_id") ON DELETE CASCADE,
  "fight_id" text NOT NULL,
  "bet_type" text NOT NULL,
  "label" text NOT NULL,
  "appearances" integer DEFAULT 0 NOT NULL,
  "total_runs" integer DEFAULT 0 NOT NULL,
  "appearance_pct" real DEFAULT 0 NOT NULL,
  "avg_edge" real DEFAULT 0 NOT NULL,
  "median_edge" real DEFAULT 0 NOT NULL,
  "edge_stability" real DEFAULT 0 NOT NULL,
  "avg_model_prob" real DEFAULT 0 NOT NULL,
  "latest_market_odd" integer,
  "weight_class" text,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "recurring_edges_event_idx" ON "recurring_edges" ("event_id");
CREATE INDEX IF NOT EXISTS "recurring_edges_appearance_idx" ON "recurring_edges" ("appearance_pct");

CREATE TABLE IF NOT EXISTS "llm_spend_log" (
  "id" text PRIMARY KEY NOT NULL,
  "source" text NOT NULL,
  "model" text NOT NULL,
  "input_tokens" integer DEFAULT 0 NOT NULL,
  "output_tokens" integer DEFAULT 0 NOT NULL,
  "cost_usd" real DEFAULT 0 NOT NULL,
  "weekly_run_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "llm_spend_log_created_idx" ON "llm_spend_log" ("created_at");

CREATE TABLE IF NOT EXISTS "weekly_cards" (
  "id" text PRIMARY KEY NOT NULL,
  "event_id" text NOT NULL REFERENCES "events"("event_id") ON DELETE CASCADE,
  "risk_model" text NOT NULL,
  "generated_at" timestamp DEFAULT now() NOT NULL,
  "card_json" jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS "weekly_cards_event_model_idx" ON "weekly_cards" ("event_id", "risk_model");
