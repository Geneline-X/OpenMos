CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"flag" text NOT NULL,
	"region" text,
	"speakers" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"access_key" text DEFAULT 'MOS-' || upper(substr(md5(random()::text), 1, 6)) NOT NULL,
	"samples_per_rater" integer DEFAULT 20 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "studies_access_key_unique" UNIQUE("access_key")
);
--> statement-breakpoint
CREATE TABLE "study_languages" (
	"study_id" uuid NOT NULL,
	"language_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_models" (
	"study_id" uuid NOT NULL,
	"model_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_language_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_model_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_models" DROP CONSTRAINT "ai_models_value_unique";--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_audio_id_audio_samples_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_models" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "audio_samples" ADD COLUMN "study_id" uuid;--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD COLUMN "study_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "languages" ADD CONSTRAINT "languages_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studies" ADD CONSTRAINT "studies_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_languages" ADD CONSTRAINT "study_languages_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_languages" ADD CONSTRAINT "study_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_models" ADD CONSTRAINT "study_models_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_models" ADD CONSTRAINT "study_models_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_model_preferences" ADD CONSTRAINT "user_model_preferences_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_model_preferences" ADD CONSTRAINT "user_model_preferences_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_token" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_expires" ON "email_verification_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_languages_code_user" ON "languages" USING btree ("code","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_languages_code_global" ON "languages" USING btree ("code") WHERE user_id IS NULL;--> statement-breakpoint
CREATE INDEX "idx_user_lang_prefs_user" ON "user_language_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_lang_prefs_lang" ON "user_language_preferences" USING btree ("language_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_lang_unique" ON "user_language_preferences" USING btree ("user_id","language_id");--> statement-breakpoint
CREATE INDEX "idx_user_model_prefs_user" ON "user_model_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_model_prefs_model" ON "user_model_preferences" USING btree ("model_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_model_unique" ON "user_model_preferences" USING btree ("user_id","model_id");--> statement-breakpoint
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_samples" ADD CONSTRAINT "audio_samples_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_sessions" ADD CONSTRAINT "evaluation_sessions_study_id_studies_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_audio_id_audio_samples_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."audio_samples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_ai_models_value_user" ON "ai_models" USING btree ("value","user_id");