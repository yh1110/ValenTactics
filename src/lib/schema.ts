import { z } from "zod";
import {
  RELATIONSHIPS,
  PREFERENCES,
  GENDERS,
  AGE_GROUPS,
  RELATIONSHIP_GOALS,
  GIRI_AWARENESS_OPTIONS,
} from "./types";

export const targetSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(20, "名前は20文字以内で入力してください"),
  relationship: z.enum(
    RELATIONSHIPS as unknown as [string, ...string[]],
    { message: "関係性を選択してください" }
  ),
  preferences: z.array(
    z.enum(PREFERENCES as unknown as [string, ...string[]])
  ),
  gaveLastYear: z.boolean(),
  receivedReturn: z.boolean(),
  memo: z.string().max(200, "メモは200文字以内で入力してください"),
  gender: z.enum(
    GENDERS as unknown as [string, ...string[]],
    { message: "性別を選択してください" }
  ),
  ageGroup: z.enum(
    AGE_GROUPS as unknown as [string, ...string[]],
    { message: "年代を選択してください" }
  ),
  returnValue: z.number().nullable(),
  gaveYearBefore: z.boolean(),
  receivedReturnYearBefore: z.boolean(),
  emotionalPriority: z
    .number()
    .int()
    .min(1, "1〜5で入力してください")
    .max(5, "1〜5で入力してください"),
  relationshipGoal: z.enum(
    RELATIONSHIP_GOALS as unknown as [string, ...string[]],
    { message: "関係性の目標を選択してください" }
  ),
  giriAwareness: z.enum(
    GIRI_AWARENESS_OPTIONS as unknown as [string, ...string[]],
    { message: "義理認識を選択してください" }
  ),
});

export const strategyFormSchema = z.object({
  totalBudget: z
    .number({ error: "予算を入力してください" })
    .min(100, "予算は100円以上を入力してください")
    .max(1000000, "予算は100万円以下にしてください"),
  targets: z
    .array(targetSchema)
    .min(1, "対象者を1人以上追加してください")
    .max(20, "対象者は最大20人までです"),
});

export type StrategyFormValues = z.infer<typeof strategyFormSchema>;
export type TargetFormValues = z.infer<typeof targetSchema>;
