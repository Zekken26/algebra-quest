-- CreateEnum
CREATE TYPE "ShopItemType" AS ENUM ('HEALTH', 'HINT', 'SKIP');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "coins" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "hintTokens" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "hearts" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "StudentProgress"
ADD COLUMN "coins" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "hintTokens" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "ShopPurchase" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questId" TEXT,
    "itemType" "ShopItemType" NOT NULL,
    "cost" INTEGER NOT NULL,
    "effect" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopPurchase_studentId_idx" ON "ShopPurchase"("studentId");

-- CreateIndex
CREATE INDEX "ShopPurchase_questId_idx" ON "ShopPurchase"("questId");

-- AddForeignKey
ALTER TABLE "ShopPurchase" ADD CONSTRAINT "ShopPurchase_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPurchase" ADD CONSTRAINT "ShopPurchase_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
