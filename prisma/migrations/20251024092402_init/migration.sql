/*
  Warnings:

  - You are about to drop the `Trade` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Trade" DROP CONSTRAINT "Trade_marketId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trade" DROP CONSTRAINT "Trade_userId_fkey";

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "liquidityParam" DOUBLE PRECISION NOT NULL DEFAULT 10,
ALTER COLUMN "status" SET DEFAULT 'open';

-- DropTable
DROP TABLE "public"."Trade";

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "marketId" TEXT NOT NULL,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
