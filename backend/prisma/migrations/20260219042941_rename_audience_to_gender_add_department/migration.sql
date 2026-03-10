/*
  Warnings:

  - You are about to drop the column `audience` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productCategory` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'KIDS', 'UNISEX');

-- CreateEnum
CREATE TYPE "ProductDepartment" AS ENUM ('CLOTHING', 'ACCESSORIES', 'HOME_LIVING', 'GEAR');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "audience",
DROP COLUMN "productCategory",
ADD COLUMN     "department" "ProductDepartment" NOT NULL DEFAULT 'CLOTHING',
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNISEX';

-- DropEnum
DROP TYPE "AudienceCategory";

-- DropEnum
DROP TYPE "ProductCategory";
