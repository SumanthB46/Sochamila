-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "fulfillmentDate" TIMESTAMP(3),
ADD COLUMN     "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "mockupUrl" TEXT,
ADD COLUMN     "pdfUrl" TEXT;

-- CreateTable
CREATE TABLE "VendorInventory" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionConfig" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "commissionPercentage" INTEGER NOT NULL DEFAULT 15,
    "minimumOrderValue" INTEGER NOT NULL DEFAULT 0,
    "payoutThreshold" INTEGER NOT NULL DEFAULT 1000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graphic" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Graphic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StickerCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StickerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sticker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sticker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorInventory_vendorId_idx" ON "VendorInventory"("vendorId");

-- CreateIndex
CREATE INDEX "VendorInventory_productId_idx" ON "VendorInventory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionConfig_vendorId_key" ON "CommissionConfig"("vendorId");

-- CreateIndex
CREATE INDEX "CommissionConfig_vendorId_idx" ON "CommissionConfig"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "StickerCategory_name_key" ON "StickerCategory"("name");

-- CreateIndex
CREATE INDEX "Sticker_categoryId_idx" ON "Sticker"("categoryId");

-- AddForeignKey
ALTER TABLE "VendorInventory" ADD CONSTRAINT "VendorInventory_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorInventory" ADD CONSTRAINT "VendorInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionConfig" ADD CONSTRAINT "CommissionConfig_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sticker" ADD CONSTRAINT "Sticker_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StickerCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
