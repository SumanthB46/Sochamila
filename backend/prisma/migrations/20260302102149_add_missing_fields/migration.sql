-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "aiGeneratedImages" TEXT[],
ADD COLUMN     "frontName" TEXT,
ADD COLUMN     "graphicUrls" TEXT[],
ADD COLUMN     "mockupImages" JSONB,
ADD COLUMN     "stickerUrls" TEXT[];
