CREATE TABLE "agent_signal_performance" (
	"id" text PRIMARY KEY NOT NULL,
	"signal_name" text NOT NULL,
	"signal_value" text NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"accuracy_rate" real,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	"config_version" integer
);
--> statement-breakpoint
CREATE TABLE "calibration_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"min_model_prob" real DEFAULT 0.55 NOT NULL,
	"min_edge_pct" real DEFAULT 0.5 NOT NULL,
	"min_agent_consensus" real DEFAULT 0.7 NOT NULL,
	"high_var_conf_floor" real DEFAULT 0.55 NOT NULL,
	"market_edge_thresholds" jsonb DEFAULT '{}'::jsonb,
	"confidence_scaling" jsonb DEFAULT '{"multiplier":1,"clampMin":30,"clampMax":95}'::jsonb,
	"variance_penalties" jsonb DEFAULT '{"high":0,"medium":0,"low":0}'::jsonb,
	"agent_signal_weights" jsonb DEFAULT '{}'::jsonb,
	"sample_size" integer DEFAULT 0,
	"calibration_score" real,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "fight_settlements" (
	"id" text PRIMARY KEY NOT NULL,
	"fight_id" text NOT NULL,
	"event_id" text,
	"winner_id" text,
	"method" text,
	"round" integer,
	"went_distance" boolean,
	"closing_odds_a" integer,
	"closing_odds_b" integer,
	"settled_at" timestamp DEFAULT now() NOT NULL,
	"data_source" text NOT NULL,
	CONSTRAINT "fight_settlements_fight_id_unique" UNIQUE("fight_id")
);
--> statement-breakpoint
CREATE TABLE "prediction_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"analysis_run_id" text NOT NULL,
	"event_id" text,
	"fight_id" text,
	"fighter_id" text,
	"bet_type" text NOT NULL,
	"label" text NOT NULL,
	"model_prob" real NOT NULL,
	"market_prob" real,
	"edge_pct" real,
	"confidence_pct" real,
	"stability_score" real,
	"variance_tag" text,
	"odds_american" integer,
	"status" text,
	"agent_signals" jsonb,
	"market_evals" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_outcomes" (
	"id" text PRIMARY KEY NOT NULL,
	"prediction_log_id" text NOT NULL,
	"fight_settlement_id" text NOT NULL,
	"outcome" text NOT NULL,
	"closing_odds" integer,
	"closing_prob" real,
	"clv" real,
	"profit_units" real,
	"graded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prediction_outcomes_prediction_log_id_unique" UNIQUE("prediction_log_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "rc_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_platform" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "fight_settlements" ADD CONSTRAINT "fight_settlements_fight_id_fights_id_fk" FOREIGN KEY ("fight_id") REFERENCES "public"."fights"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_logs" ADD CONSTRAINT "prediction_logs_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_outcomes" ADD CONSTRAINT "prediction_outcomes_prediction_log_id_prediction_logs_id_fk" FOREIGN KEY ("prediction_log_id") REFERENCES "public"."prediction_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_outcomes" ADD CONSTRAINT "prediction_outcomes_fight_settlement_id_fight_settlements_id_fk" FOREIGN KEY ("fight_settlement_id") REFERENCES "public"."fight_settlements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_rc_customer_id_unique" UNIQUE("rc_customer_id");