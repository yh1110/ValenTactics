-- AlterTable
ALTER TABLE "Target" ADD COLUMN     "recentEpisodes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "recipientActions" TEXT[] DEFAULT ARRAY[]::TEXT[];
