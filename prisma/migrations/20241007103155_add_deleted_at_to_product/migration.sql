/*
  Warnings:

  - You are about to drop the column `userId` on the `cart` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL;
