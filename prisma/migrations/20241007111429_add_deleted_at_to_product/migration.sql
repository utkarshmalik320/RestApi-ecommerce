-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "brandId" INTEGER,
ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "productName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "variant" TEXT;
