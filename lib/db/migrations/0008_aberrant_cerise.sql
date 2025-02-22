ALTER TABLE "User" ADD COLUMN "lastName" varchar(64);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "emailVerified" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "role" varchar DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "orgId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_orgId_Org_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."Org"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
