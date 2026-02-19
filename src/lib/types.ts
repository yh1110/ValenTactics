export type Relationship =
  | "上司"
  | "同僚"
  | "友人"
  | "気になる人"
  | "パートナー"
  | "その他";

export type Preference =
  | "甘党"
  | "お酒好き"
  | "健康志向"
  | "コーヒー好き"
  | "紅茶好き"
  | "和菓子派"
  | "ブランド志向";

export type Gender = "男性" | "女性" | "その他" | "未回答";

export type AgeGroup = "10代" | "20代" | "30代" | "40代" | "50代+";

export type RelationshipGoal =
  | "現状維持"
  | "深めたい"
  | "礼儀として"
  | "距離を置きたい";

export type GiriAwareness =
  | "義理と認識される"
  | "本命と受け取られる可能性あり"
  | "不明";

export type EmotionalPriority = 1 | 2 | 3 | 4 | 5;

export type SuccessType =
  | "投資型成功"
  | "感情型成功"
  | "関係構築型成功"
  | "完全成功"
  | "要見直し"
  | "損切り推奨";

export type Rank = "S" | "A" | "B" | "C";

export interface Target {
  id: string;
  name: string;
  relationship: Relationship;
  preferences: Preference[];
  gaveLastYear: boolean;
  receivedReturn: boolean;
  memo: string;
  gender: Gender;
  ageGroup: AgeGroup;
  returnValue: number | null;
  gaveYearBefore: boolean;
  receivedReturnYearBefore: boolean;
  emotionalPriority: EmotionalPriority;
  relationshipGoal: RelationshipGoal;
  giriAwareness: GiriAwareness;
}

export interface GiftSuggestion {
  item: string;
  price: number;
  reason: string;
}

export interface RoiPrediction {
  returnProbability: number;
  expectedMultiplier: number;
}

export interface ScoreBreakdown {
  roi: number;
  relationship: number;
  emotion: number;
  total: number;
}

export interface AnalyzedTarget {
  id: string;
  name: string;
  relationship: Relationship;
  rank: Rank;
  rankReason: string;
  successType: SuccessType;
  scores: ScoreBreakdown;
  allocatedBudget: number;
  giftSuggestion: GiftSuggestion;
  message: string;
  roiPrediction: RoiPrediction;
  emotionalPriority: EmotionalPriority;
}

export interface TimelineItem {
  date: string;
  action: string;
}

export interface AnalysisResult {
  targets: AnalyzedTarget[];
  timeline: TimelineItem[];
  warnings: string[];
  totalBudget: number;
}

export interface Strategy {
  id: string;
  totalBudget: number;
  targets: Target[];
  analysisResult: AnalysisResult | null;
  createdAt: string;
}

export const RELATIONSHIPS: Relationship[] = [
  "上司",
  "同僚",
  "友人",
  "気になる人",
  "パートナー",
  "その他",
];

export const PREFERENCES: Preference[] = [
  "甘党",
  "お酒好き",
  "健康志向",
  "コーヒー好き",
  "紅茶好き",
  "和菓子派",
  "ブランド志向",
];

export const GENDERS: Gender[] = ["男性", "女性", "その他", "未回答"];

export const AGE_GROUPS: AgeGroup[] = ["10代", "20代", "30代", "40代", "50代+"];

export const RELATIONSHIP_GOALS: RelationshipGoal[] = [
  "現状維持",
  "深めたい",
  "礼儀として",
  "距離を置きたい",
];

export const GIRI_AWARENESS_OPTIONS: GiriAwareness[] = [
  "義理と認識される",
  "本命と受け取られる可能性あり",
  "不明",
];

export const SUCCESS_TYPE_CONFIG: Record<
  SuccessType,
  { emoji: string; label: string; color: string }
> = {
  投資型成功: { emoji: "💰", label: "Investment Win", color: "text-emerald-600" },
  感情型成功: { emoji: "💝", label: "Emotional Win", color: "text-pink-600" },
  関係構築型成功: { emoji: "🤝", label: "Relationship Win", color: "text-blue-600" },
  完全成功: { emoji: "📈", label: "Perfect Win", color: "text-amber-600" },
  要見直し: { emoji: "⚠️", label: "Review Needed", color: "text-yellow-600" },
  損切り推奨: { emoji: "✂️", label: "Cut Loss", color: "text-red-600" },
};
