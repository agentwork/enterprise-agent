CREATE TYPE "public"."activity_type" AS ENUM('note', 'call', 'meeting', 'email', 'task');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcp_servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"command" text NOT NULL,
	"args" jsonb DEFAULT '[]'::jsonb,
	"env" jsonb DEFAULT '{}'::jsonb,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mcp_servers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"is_encrypted" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" DROP CONSTRAINT "activities_performed_by_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_owner_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "deals" DROP CONSTRAINT "deals_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "checkpoint_writes" ALTER COLUMN "value" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "type" SET DATA TYPE "public"."activity_type" USING "type"::"public"."activity_type";--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ALTER COLUMN "stage" SET DEFAULT 'lead'::"public"."deal_stage";--> statement-breakpoint
ALTER TABLE "deals" ALTER COLUMN "stage" SET DATA TYPE "public"."deal_stage" USING "stage"::"public"."deal_stage";--> statement-breakpoint
ALTER TABLE "deals" ALTER COLUMN "stage" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ALTER COLUMN "probability" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "deals" ALTER COLUMN "probability" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "client_id" uuid;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "deal_id" uuid;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "sentiment" text;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" DROP COLUMN "entity_type";--> statement-breakpoint
ALTER TABLE "activities" DROP COLUMN "entity_id";--> statement-breakpoint
ALTER TABLE "activities" DROP COLUMN "performed_by";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "owner_id";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN "value";