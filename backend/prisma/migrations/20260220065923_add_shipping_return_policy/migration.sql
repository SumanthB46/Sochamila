-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "returnPolicy" TEXT NOT NULL DEFAULT '30-day return window from delivery date
Product must be unused and in original packaging
Free return shipping for defective items',
ADD COLUMN     "shippingPolicy" TEXT NOT NULL DEFAULT 'Free shipping on orders above ₹500
Standard delivery: 5-7 business days
Express delivery: 2-3 business days (extra charges apply)';
