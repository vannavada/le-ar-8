/*
  Warnings:

  - You are about to drop the `TechVaultReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Hub" AS ENUM ('TECH_VAULT', 'THOUGHT_FORGE', 'FINANCE_HUB', 'LEARN_HUB');

-- DropForeignKey
ALTER TABLE "TechVaultReview" DROP CONSTRAINT "TechVaultReview_authorId_fkey";

-- DropTable
DROP TABLE "TechVaultReview";

-- DropEnum
DROP TYPE "TechVaultCategory";

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "hub" "Hub" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER,
    "productName" TEXT,
    "productCategory" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NowPage" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NowPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Article_hub_published_publishedAt_idx" ON "Article"("hub", "published", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_hub_slug_key" ON "Article"("hub", "slug");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
