/*
  Warnings:

  - You are about to drop the column `scoreEmotion` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `scoreRelationship` on the `AnalysisResult` table. All the data in the column will be lost.
  - You are about to drop the column `successType` on the `AnalysisResult` table. All the data in the column will be lost.
  - Added the required column `scoreAffinity` to the `AnalysisResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreIntimacy` to the `AnalysisResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AnalysisResult" DROP COLUMN "scoreEmotion",
DROP COLUMN "scoreRelationship",
DROP COLUMN "successType",
ADD COLUMN     "giftStory" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "scoreAffinity" INTEGER NOT NULL,
ADD COLUMN     "scoreIntimacy" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Target" ADD COLUMN     "benefitType" TEXT NOT NULL DEFAULT '無形';
