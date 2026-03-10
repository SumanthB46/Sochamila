/*
  Warnings:

  - Added the required column `minPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `thumbnail` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "minPrice" INTEGER NOT NULL,
ALTER COLUMN "thumbnail" SET NOT NULL;
