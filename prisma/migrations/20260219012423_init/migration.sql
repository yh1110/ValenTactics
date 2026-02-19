-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT '未回答',
    "ageGroup" TEXT NOT NULL DEFAULT '30代',
    "relationship" TEXT NOT NULL,
    "relationshipGoal" TEXT NOT NULL DEFAULT '現状維持',
    "emotionalPriority" INTEGER NOT NULL DEFAULT 3,
    "giriAwareness" TEXT NOT NULL DEFAULT '不明',
    "gaveLastYear" BOOLEAN NOT NULL DEFAULT false,
    "receivedReturn" BOOLEAN NOT NULL DEFAULT false,
    "returnValue" INTEGER,
    "gaveYearBefore" BOOLEAN NOT NULL DEFAULT false,
    "receivedReturnYearBefore" BOOLEAN NOT NULL DEFAULT false,
    "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "memo" TEXT NOT NULL DEFAULT '',
    "budget" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetId" TEXT NOT NULL,
    "scoreRoi" INTEGER NOT NULL,
    "scoreRelationship" INTEGER NOT NULL,
    "scoreEmotion" INTEGER NOT NULL,
    "scoreTotal" INTEGER NOT NULL,
    "rank" TEXT NOT NULL,
    "rankReason" TEXT NOT NULL,
    "successType" TEXT NOT NULL,
    "giftItem" TEXT NOT NULL,
    "giftPrice" INTEGER NOT NULL,
    "giftReason" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "returnProbability" DOUBLE PRECISION NOT NULL,
    "expectedMultiplier" DOUBLE PRECISION NOT NULL,
    "allocatedBudget" INTEGER NOT NULL,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisResult_targetId_key" ON "AnalysisResult"("targetId");

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;
