import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { analyzeTarget } from "@/lib/analysis";
import type {
  BenefitType,
  EmotionalPriority,
  GiftReaction,
  Personality,
  Preference,
  Relationship,
  RelationshipGoal,
  ReturnTendency,
} from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { id } = await params;
  const target = await prisma.target.findUnique({
    where: { id, userId: user.id },
  });

  if (!target) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }

  const result = analyzeTarget({
    name: target.name,
    relationship: target.relationship as Relationship,
    benefitType: target.benefitType as BenefitType,
    personality: target.personality as Personality[],
    preferences: target.preferences as Preference[],
    recentInterests: target.recentInterests,
    giftReaction: target.giftReaction as GiftReaction,
    relationshipGoal: target.relationshipGoal as RelationshipGoal,
    emotionalPriority: target.emotionalPriority as EmotionalPriority,
    giriAwareness: target.giriAwareness,
    returnTendency: target.returnTendency as ReturnTendency,
    gaveLastYear: target.gaveLastYear,
    receivedReturn: target.receivedReturn,
    returnValue: target.returnValue,
    gaveYearBefore: target.gaveYearBefore,
    receivedReturnYearBefore: target.receivedReturnYearBefore,
    budget: target.budget,
    memo: target.memo,
  });

  const analysis = await prisma.analysisResult.upsert({
    where: { targetId: id },
    update: {
      scoreIntimacy: result.scores.intimacy,
      scoreRoi: result.scores.roi,
      scoreAffinity: result.scores.affinity,
      scoreTotal: result.scores.total,
      rank: result.rank,
      rankReason: result.rankReason,
      giftItem: result.giftSuggestion.item,
      giftPrice: result.giftSuggestion.price,
      giftReason: result.giftSuggestion.reason,
      giftStory: result.giftSuggestion.story,
      message: result.message,
      returnProbability: result.roiPrediction.returnProbability,
      expectedMultiplier: result.roiPrediction.expectedMultiplier,
      questions: result.questions,
      allocatedBudget: result.allocatedBudget,
    },
    create: {
      targetId: id,
      scoreIntimacy: result.scores.intimacy,
      scoreRoi: result.scores.roi,
      scoreAffinity: result.scores.affinity,
      scoreTotal: result.scores.total,
      rank: result.rank,
      rankReason: result.rankReason,
      giftItem: result.giftSuggestion.item,
      giftPrice: result.giftSuggestion.price,
      giftReason: result.giftSuggestion.reason,
      giftStory: result.giftSuggestion.story,
      message: result.message,
      returnProbability: result.roiPrediction.returnProbability,
      expectedMultiplier: result.roiPrediction.expectedMultiplier,
      questions: result.questions,
      allocatedBudget: result.allocatedBudget,
    },
  });

  return NextResponse.json(analysis);
}
