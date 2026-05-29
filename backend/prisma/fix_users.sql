-- Add missing columns if they don't exist
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hasPassword" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: existing users with a password are complete
UPDATE "User"
SET "isProfileComplete" = true,
    "hasPassword" = true
WHERE "password" IS NOT NULL
  AND "isProfileComplete" = false;
