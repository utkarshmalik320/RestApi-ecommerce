/*
  Warnings:

  - You are about to drop the column `address` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country";
