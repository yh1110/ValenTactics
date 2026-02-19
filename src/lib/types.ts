export type Relationship =
  | "上司"
  | "同僚"
  | "友人"
  | "気になる人"
  | "パートナー"
  | "その他";

export type Gender = "男性" | "女性" | "その他" | "未回答";

export type AgeGroup = "10代" | "20代" | "30代" | "40代" | "50代+";

export type BenefitType = "有形" | "無形";

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

export type Rank = "S" | "A" | "B" | "C";

// ── 相手の情報フィールド ──

export type Personality =
  | "几帳面"
  | "おおらか"
  | "こだわり強い"
  | "社交的"
  | "シャイ"
  | "合理的"
  | "感情的"
  | "マイペース";

export type ReturnTendency =
  | "律儀に返す"
  | "気分次第"
  | "返さないタイプ"
  | "不明";

export type GiftReaction =
  | "素直に喜ぶ"
  | "控えめに受け取る"
  | "恐縮するタイプ"
  | "不明";

export type Preference =
  | "甘党"
  | "辛党"
  | "お酒好き"
  | "コーヒー好き"
  | "紅茶好き"
  | "和菓子派"
  | "グルメ"
  | "健康志向"
  | "アウトドア派"
  | "インドア派"
  | "ファッション好き"
  | "読書家"
  | "ガジェット好き"
  | "ブランド志向"
  | "コスパ重視"
  | "手作りを評価"
  | "実用的なもの好き"
  | "サプライズ好き"
  | "定番が安心";

export interface PreferenceCategory {
  label: string;
  items: Preference[];
}

// ── スコア・分析結果 ──

export interface ScoreBreakdown {
  intimacy: number;
  roi: number;
  affinity: number;
  total: number;
}

export interface GiftSuggestion {
  item: string;
  price: number;
  reason: string;
  story: string;
}

export interface RoiPrediction {
  returnProbability: number;
  expectedMultiplier: number;
}

// ── 定数配列 ──

export const RELATIONSHIPS: Relationship[] = [
  "上司",
  "同僚",
  "友人",
  "気になる人",
  "パートナー",
  "その他",
];

export const GENDERS: Gender[] = ["男性", "女性", "その他", "未回答"];

export const AGE_GROUPS: AgeGroup[] = ["10代", "20代", "30代", "40代", "50代+"];

export const BENEFIT_TYPES: { value: BenefitType; label: string; description: string; emoji: string }[] = [
  {
    value: "有形",
    label: "有形利益を最大化",
    description: "お返しのROI・昇進への効果など、目に見えるリターンを重視",
    emoji: "💰",
  },
  {
    value: "無形",
    label: "無形利益を最大化",
    description: "好感度・関係性の深化・自分の満足感など、感情的リターンを重視",
    emoji: "💝",
  },
];

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

export const PERSONALITIES: Personality[] = [
  "几帳面",
  "おおらか",
  "こだわり強い",
  "社交的",
  "シャイ",
  "合理的",
  "感情的",
  "マイペース",
];

export const RETURN_TENDENCIES: ReturnTendency[] = [
  "律儀に返す",
  "気分次第",
  "返さないタイプ",
  "不明",
];

export const GIFT_REACTIONS: GiftReaction[] = [
  "素直に喜ぶ",
  "控えめに受け取る",
  "恐縮するタイプ",
  "不明",
];

export const PREFERENCE_CATEGORIES: PreferenceCategory[] = [
  {
    label: "味覚・食",
    items: ["甘党", "辛党", "お酒好き", "コーヒー好き", "紅茶好き", "和菓子派", "グルメ"],
  },
  {
    label: "ライフスタイル",
    items: ["健康志向", "アウトドア派", "インドア派", "ファッション好き", "読書家", "ガジェット好き"],
  },
  {
    label: "価値観",
    items: ["ブランド志向", "コスパ重視", "手作りを評価", "実用的なもの好き", "サプライズ好き", "定番が安心"],
  },
];

export const ALL_PREFERENCES: Preference[] = PREFERENCE_CATEGORIES.flatMap((c) => c.items);

export const RANK_CONFIG: Record<
  Rank,
  { label: string; color: string; bg: string; border: string }
> = {
  S: { label: "最優先", color: "text-rank-s", bg: "bg-rose-50", border: "border-rank-s/30" },
  A: { label: "重要", color: "text-rank-a", bg: "bg-orange-50", border: "border-rank-a/30" },
  B: { label: "標準", color: "text-rank-b", bg: "bg-blue-50", border: "border-rank-b/30" },
  C: { label: "最小限", color: "text-rank-c", bg: "bg-gray-50", border: "border-rank-c/30" },
};
