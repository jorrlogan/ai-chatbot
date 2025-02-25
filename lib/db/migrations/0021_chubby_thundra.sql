ALTER TABLE "Invitation" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "Invitation" ADD COLUMN "createdAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "Invitation" ADD COLUMN "updatedAt" timestamp DEFAULT now();