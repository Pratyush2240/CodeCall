-- AlterTable
ALTER TABLE \"User\" ADD COLUMN \"hasPassword\" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN \"isProfileComplete\" BOOLEAN NOT NULL DEFAULT false;
