/*
  Warnings:

  - You are about to drop the column `downloadCount` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `lastDownloadedAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `lastViewedAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Document` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Document_downloadCount_idx";

-- DropIndex
DROP INDEX "public"."Document_level_idx";

-- DropIndex
DROP INDEX "public"."Document_uploadedById_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "downloadCount",
DROP COLUMN "lastDownloadedAt",
DROP COLUMN "lastViewedAt",
DROP COLUMN "viewCount";
