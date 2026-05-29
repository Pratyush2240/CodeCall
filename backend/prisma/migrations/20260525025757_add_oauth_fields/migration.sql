-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatar" TEXT,
ADD COLUMN "isOAuthUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "hasPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "provider" TEXT,
ADD COLUMN "providerId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");

-- Backfill: existing email/password users are considered complete
UPDATE "User" SET "isProfileComplete" = true, "hasPassword" = true WHERE "password" IS NOT NULL;
