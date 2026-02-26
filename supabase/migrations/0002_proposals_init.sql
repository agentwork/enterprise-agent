CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'review', 'sent', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"content" jsonb NOT NULL,
	"created_by" uuid DEFAULT auth.uid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proposals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"structure" jsonb NOT NULL,
	"created_by" uuid DEFAULT auth.uid(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Enable read access for own proposals" ON "proposals" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid() = "proposals"."created_by");--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users" ON "proposals" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = "proposals"."created_by");--> statement-breakpoint
CREATE POLICY "Enable update for own proposals" ON "proposals" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = "proposals"."created_by");--> statement-breakpoint
CREATE POLICY "Enable delete for own proposals" ON "proposals" AS PERMISSIVE FOR DELETE TO "authenticated" USING (auth.uid() = "proposals"."created_by");--> statement-breakpoint
CREATE POLICY "Enable read access for authenticated users" ON "templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users" ON "templates" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = "templates"."created_by");--> statement-breakpoint
CREATE POLICY "Enable update for owners" ON "templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = "templates"."created_by");