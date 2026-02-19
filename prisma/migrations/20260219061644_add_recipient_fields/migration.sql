-- AlterTable
ALTER TABLE "Target" ADD COLUMN     "giftReaction" TEXT NOT NULL DEFAULT '不明',
ADD COLUMN     "personality" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recentInterests" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "returnTendency" TEXT NOT NULL DEFAULT '不明';
