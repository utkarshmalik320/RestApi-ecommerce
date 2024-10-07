/*
  Warnings:

  - You are about to drop the column `accountId` on the `cart` table. All the data in the column will be lost.
  - Changed the type of `productId` on the `cart` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "cart" DROP COLUMN "accountId",
ADD COLUMN     "aaccountId" INTEGER,
DROP COLUMN "productId",
ADD COLUMN     "productId" INTEGER NOT NULL;
