/*
  Warnings:

  - The values [GEAR] on the enum `AudienceCategory` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[aadhaar]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pan]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('REGULAR', 'GEAR', 'ACCESSORIES');

-- AlterEnum
BEGIN;
CREATE TYPE "AudienceCategory_new" AS ENUM ('MEN', 'WOMEN', 'KIDS');
ALTER TABLE "Product" ALTER COLUMN "audience" TYPE "AudienceCategory_new" USING ("audience"::text::"AudienceCategory_new");
ALTER TYPE "AudienceCategory" RENAME TO "AudienceCategory_old";
ALTER TYPE "AudienceCategory_new" RENAME TO "AudienceCategory";
DROP TYPE "public"."AudienceCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productCategory" "ProductCategory" NOT NULL DEFAULT 'REGULAR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aadhaar" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gst" TEXT,
ADD COLUMN     "ifsc" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "pan" TEXT,
ADD COLUMN     "payoutMethod" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "upiId" TEXT,
ADD COLUMN     "vendorType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_aadhaar_key" ON "User"("aadhaar");

-- CreateIndex
CREATE UNIQUE INDEX "User_pan_key" ON "User"("pan");
