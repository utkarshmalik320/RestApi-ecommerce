/*
  Warnings:

  - You are about to drop the column `accountId` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "cart" DROP COLUMN "accountId",
ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "accountId",
ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "account";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
