-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brandName" TEXT NOT NULL DEFAULT 'Indian Garage',
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Fashion',
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
