"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { targetFormSchema, analysisSchema, type TargetFormValues } from "@/schema";
import { runDifyAnalysis, buildDifyInputs } from "@/lib/dify";
import { analyzeTarget as runLocalAnalysis, type TargetInput } from "@/lib/analysis";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Zod で全 enum 値をバリデーション済みのデータから分析を実行し DB に保存する。
 * targetFormSchema.parse() 済みの値を受け取るため unsafe cast は不要
 * （TypeScript 上の型変換のみ。ランタイム値は Zod で保証済み）
 */
async function runAnalysis(targetId: string, data: TargetFormValues) {
  // Zod バリデーション済み → TargetInput への変換は型レベルのみ（値は検証済み）
  const input = data as unknown as TargetInput;

  let fields;
  try {
    const difyResult = await runDifyAnalysis(buildDifyInputs(data));
    fields = analysisSchema.parse(difyResult);
  } catch (e) {
    console.warn("Dify API failed, falling back to local analysis:", e);
    const result = runLocalAnalysis(input);
    fields = analysisSchema.parse({
      scoreIntimacy: result.scores.intimacy,
      scoreRoi: result.scores.roi,
      scoreGiftFit: result.scores.giftFit,
      scoreTotal: result.scores.total,
      rank: result.rank,
      rankReason: result.rankReason,
      successType: result.successType,
      giftItem: result.giftSuggestion.item,
      giftPrice: result.giftSuggestion.price,
      giftReason: result.giftSuggestion.reason,
      giftStory: result.giftSuggestion.story,
      message: result.message,
      returnProbability: result.roiPrediction.returnProbability,
      expectedMultiplier: result.roiPrediction.expectedMultiplier,
      questions: result.questions,
      riskWarning: result.riskWarning,
    });
  }

  await prisma.analysisResult.upsert({
    where: { targetId },
    update: { ...fields, allocatedBudget: data.budget },
    create: { targetId, ...fields, allocatedBudget: data.budget },
  });
}

export async function createTargetAndAnalyze(
  formData: TargetFormValues,
): Promise<ActionResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return { success: false, error: "未認証" };

  const parsed = targetFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "入力データが不正です" };
  }

  const data = parsed.data;
  const target = await prisma.target.create({
    data: {
      userId: user.id,
      name: data.name,
      gender: data.gender,
      ageGroup: data.ageGroup,
      relationship: data.relationship,
      benefitType: data.benefitType,
      personality: data.personality,
      preferences: data.preferences,
      recentInterests: data.recentInterests,
      giftReaction: data.giftReaction,
      recipientActions: data.recipientActions,
      recentEpisodes: data.recentEpisodes,
      relationshipGoal: data.relationshipGoal,
      emotionalPriority: data.emotionalPriority,
      giriAwareness: data.giriAwareness,
      returnTendency: data.returnTendency,
      gaveLastYear: data.gaveLastYear,
      receivedReturn: data.receivedReturn,
      returnValue: data.returnValue,
      gaveYearBefore: data.gaveYearBefore,
      receivedReturnYearBefore: data.receivedReturnYearBefore,
      memo: data.memo,
      budget: data.budget,
    },
  });

  await runAnalysis(target.id, data);
  return { success: true, data: { id: target.id } };
}

export async function updateTargetAndAnalyze(
  id: string,
  formData: TargetFormValues,
): Promise<ActionResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return { success: false, error: "未認証" };

  const parsed = targetFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "入力データが不正です" };
  }

  const existing = await prisma.target.findUnique({
    where: { id, userId: user.id },
  });
  if (!existing) return { success: false, error: "対象者が見つかりません" };

  const data = parsed.data;

  await prisma.analysisResult.deleteMany({ where: { targetId: id } });
  await prisma.target.update({
    where: { id, userId: user.id },
    data: {
      name: data.name,
      gender: data.gender,
      ageGroup: data.ageGroup,
      relationship: data.relationship,
      benefitType: data.benefitType,
      personality: data.personality,
      preferences: data.preferences,
      recentInterests: data.recentInterests,
      giftReaction: data.giftReaction,
      recipientActions: data.recipientActions,
      recentEpisodes: data.recentEpisodes,
      relationshipGoal: data.relationshipGoal,
      emotionalPriority: data.emotionalPriority,
      giriAwareness: data.giriAwareness,
      returnTendency: data.returnTendency,
      gaveLastYear: data.gaveLastYear,
      receivedReturn: data.receivedReturn,
      returnValue: data.returnValue,
      gaveYearBefore: data.gaveYearBefore,
      receivedReturnYearBefore: data.receivedReturnYearBefore,
      memo: data.memo,
      budget: data.budget,
    },
  });

  await runAnalysis(id, data);
  return { success: true, data: { id } };
}

export async function deleteTarget(
  id: string,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { success: false, error: "未認証" };

  const existing = await prisma.target.findUnique({
    where: { id, userId: user.id },
  });
  if (!existing) return { success: false, error: "対象者が見つかりません" };

  await prisma.target.delete({ where: { id, userId: user.id } });
  return { success: true, data: undefined };
}
