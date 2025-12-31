CREATE TABLE "analysis_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "agent_outputs" CASCADE;--> statement-breakpoint
DROP TABLE "fight_markets" CASCADE;--> statement-breakpoint
DROP TABLE "fighter_news" CASCADE;--> statement-breakpoint
DROP TABLE "fighter_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "fights" CASCADE;--> statement-breakpoint
DROP TABLE "final_predictions" CASCADE;--> statement-breakpoint
DROP TABLE "round_stats" CASCADE;--> statement-breakpoint
DROP TABLE "round_narratives" CASCADE;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD CONSTRAINT "analysis_runs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;