CREATE TABLE IF NOT EXISTS "Org" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "firstName" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "lastName" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "emailVerified" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "role" varchar DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "orgId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_orgId_Org_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
