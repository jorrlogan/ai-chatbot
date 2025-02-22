ALTER TABLE "User" DROP CONSTRAINT "User_orgId_Org_id_fk";
--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "firstName";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastName";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "orgId";