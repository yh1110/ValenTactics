import { z } from "zod";

export const analysisSchema = z.object({
  scoreIntimacy: z.number().int().min(0).max(100),
  scoreRoi: z.number().int().min(0).max(100),
  scoreGiftFit: z.number().int().min(0).max(100),
  scoreTotal: z.number().int().min(0).max(100),
  rank: z.enum(["S", "A", "B", "C"]),
  rankReason: z.string().max(300),
  successType: z.enum([
    "完全成功", "投資型", "感情型", "関係構築型", "損切り推奨", "要検討",
  ]),
  giftItem: z.string().min(1).max(100),
  giftPrice: z.number().int().min(100).max(100000),
  giftReason: z.string().max(200),
  giftStory: z.string().max(500),
  message: z.string().min(1).max(500),
  returnProbability: z.number().min(0).max(1),
  expectedMultiplier: z.number().min(0).max(10),
  questions: z.array(z.string().max(200)).max(5),
  riskWarning: z.string().max(300),
});

export type AnalysisFields = z.infer<typeof analysisSchema>;
