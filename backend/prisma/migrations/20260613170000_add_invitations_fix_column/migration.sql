-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Rename lastActivity to lastActivityAt (if the old name exists)
DO $$ BEGIN
    ALTER TABLE "Room" RENAME COLUMN "lastActivity" TO "lastActivityAt";
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- CreateTable (if not exists)
CREATE TABLE IF NOT EXISTS "RoomInvitation" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "RoomInvitation_roomId_receiverId_key" ON "RoomInvitation"("roomId", "receiverId");
CREATE INDEX IF NOT EXISTS "RoomInvitation_receiverId_idx" ON "RoomInvitation"("receiverId");
CREATE INDEX IF NOT EXISTS "RoomInvitation_senderId_idx" ON "RoomInvitation"("senderId");
CREATE INDEX IF NOT EXISTS "RoomInvitation_roomId_idx" ON "RoomInvitation"("roomId");

-- AddForeignKey (if not exists)
DO $$ BEGIN
    ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
