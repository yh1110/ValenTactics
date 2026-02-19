-- Rename scoreAffinity → scoreGiftFit
ALTER TABLE "AnalysisResult" RENAME COLUMN "scoreAffinity" TO "scoreGiftFit";

-- Add new columns
ALTER TABLE "AnalysisResult" ADD COLUMN "successType" TEXT NOT NULL DEFAULT '関係構築型';
ALTER TABLE "AnalysisResult" ADD COLUMN "riskWarning" TEXT NOT NULL DEFAULT '';
