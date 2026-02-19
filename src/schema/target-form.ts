import { z } from "zod";
import {
  RELATIONSHIPS,
  GENDERS,
  AGE_GROUPS,
  ALL_PREFERENCES,
  PERSONALITIES,
  RETURN_TENDENCIES,
  GIFT_REACTIONS,
  RELATIONSHIP_GOALS,
  GIRI_AWARENESS_OPTIONS,
  ALL_RECIPIENT_ACTIONS,
} from "@/lib/types";

// Step 1: 基本情報 + 目的
export const step1Schema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(20, "名前は20文字以内で入力してください"),
  gender: z.enum(GENDERS as unknown as [string, ...string[]], {
    message: "性別を選択してください",
  }),
  ageGroup: z.enum(AGE_GROUPS as unknown as [string, ...string[]], {
    message: "年代を選択してください",
  }),
  relationship: z.enum(RELATIONSHIPS as unknown as [string, ...string[]], {
    message: "関係性を選択してください",
  }),
  benefitType: z.enum(["有形", "無形"] as [string, ...string[]], {
    message: "目的を選択してください",
  }),
});

// Step 2: 相手を知る
export const step2Schema = z.object({
  personality: z.array(
    z.enum(PERSONALITIES as unknown as [string, ...string[]])
  ),
  preferences: z.array(
    z.enum(ALL_PREFERENCES as unknown as [string, ...string[]])
  ),
  recentInterests: z.string().max(200, "200文字以内で入力してください"),
  giftReaction: z.enum(GIFT_REACTIONS as unknown as [string, ...string[]], {
    message: "ギフト反応を選択してください",
  }),
});

// Step 3: 関係性 & 過去データ
export const step3Schema = z.object({
  recipientActions: z.array(
    z.enum(ALL_RECIPIENT_ACTIONS as unknown as [string, ...string[]])
  ),
  recentEpisodes: z.string().max(400, "400文字以内で入力してください"),
  relationshipGoal: z.enum(
    RELATIONSHIP_GOALS as unknown as [string, ...string[]],
    { message: "関係性の目標を選択してください" }
  ),
  emotionalPriority: z
    .number()
    .int()
    .min(1, "1〜5で入力してください")
    .max(5, "1〜5で入力してください"),
  giriAwareness: z.enum(
    GIRI_AWARENESS_OPTIONS as unknown as [string, ...string[]],
    { message: "義理認識を選択してください" }
  ),
  returnTendency: z.enum(
    RETURN_TENDENCIES as unknown as [string, ...string[]],
    { message: "お返し傾向を選択してください" }
  ),
  gaveLastYear: z.boolean(),
  receivedReturn: z.boolean(),
  returnValue: z.number().nullable(),
  gaveYearBefore: z.boolean(),
  receivedReturnYearBefore: z.boolean(),
});

// Step 4: 予算 & メモ
export const step4Schema = z.object({
  memo: z.string().max(200, "メモは200文字以内で入力してください"),
  budget: z
    .number({ error: "予算を入力してください" })
    .min(100, "予算は100円以上を入力してください")
    .max(100000, "予算は10万円以下にしてください"),
});

export const targetFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type Step3Values = z.infer<typeof step3Schema>;
export type Step4Values = z.infer<typeof step4Schema>;
export type TargetFormValues = z.infer<typeof targetFormSchema>;
