interface DifyWorkflowInput {
  name: string;
  relationship: string;
  benefit_type: string;
  personality: string;
  preferences: string;
  recent_interests: string;
  gift_reaction: string;
  relationship_goal: string;
  emotional_priority: string;
  giri_awareness: string;
  return_tendency: string;
  gave_last_year: string;
  received_return: string;
  return_value: string;
  gave_year_before: string;
  received_return_year_before: string;
  budget: string;
  memo: string;
}

export interface DifyAnalysisResult {
  scoreIntimacy: number;
  scoreRoi: number;
  scoreAffinity: number;
  scoreTotal: number;
  rank: string;
  rankReason: string;
  giftItem: string;
  giftPrice: number;
  giftReason: string;
  giftStory: string;
  message: string;
  returnProbability: number;
  expectedMultiplier: number;
  questions: string[];
  allocatedBudget: number;
}

interface DifyWorkflowResponse {
  data: {
    outputs: Record<string, unknown>;
  };
}

export function buildDifyInputs(target: {
  name: string;
  relationship: string;
  benefitType: string;
  personality: string[];
  preferences: string[];
  recentInterests: string;
  giftReaction: string;
  relationshipGoal: string;
  emotionalPriority: number;
  giriAwareness: string;
  returnTendency: string;
  gaveLastYear: boolean;
  receivedReturn: boolean;
  returnValue: number | null;
  gaveYearBefore: boolean;
  receivedReturnYearBefore: boolean;
  budget: number;
  memo: string;
}): DifyWorkflowInput {
  return {
    name: target.name,
    relationship: target.relationship,
    benefit_type: target.benefitType,
    personality: target.personality.join(", "),
    preferences: target.preferences.join(", "),
    recent_interests: target.recentInterests,
    gift_reaction: target.giftReaction,
    relationship_goal: target.relationshipGoal,
    emotional_priority: String(target.emotionalPriority),
    giri_awareness: target.giriAwareness,
    return_tendency: target.returnTendency,
    gave_last_year: target.gaveLastYear ? "はい" : "いいえ",
    received_return: target.receivedReturn ? "はい" : "いいえ",
    return_value: target.returnValue != null ? String(target.returnValue) : "不明",
    gave_year_before: target.gaveYearBefore ? "はい" : "いいえ",
    received_return_year_before: target.receivedReturnYearBefore ? "はい" : "いいえ",
    budget: String(target.budget),
    memo: target.memo,
  };
}

export async function runDifyAnalysis(
  inputs: DifyWorkflowInput
): Promise<DifyAnalysisResult> {
  const apiUrl = process.env.DIFY_API_URL;
  const apiKey = process.env.DIFY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("DIFY_API_URL or DIFY_API_KEY is not configured");
  }

  const response = await fetch(`${apiUrl}/v1/workflows/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      response_mode: "blocking",
      user: "valentactics-system",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dify API error (${response.status}): ${text}`);
  }

  const result = (await response.json()) as DifyWorkflowResponse;
  const outputs = result.data.outputs;

  return {
    scoreIntimacy: Number(outputs.scoreIntimacy) || 50,
    scoreRoi: Number(outputs.scoreRoi) || 50,
    scoreAffinity: Number(outputs.scoreAffinity) || 50,
    scoreTotal: Number(outputs.scoreTotal) || 50,
    rank: String(outputs.rank || "B"),
    rankReason: String(outputs.rankReason || ""),
    giftItem: String(outputs.giftItem || "焼き菓子アソート"),
    giftPrice: Number(outputs.giftPrice) || 1500,
    giftReason: String(outputs.giftReason || ""),
    giftStory: String(outputs.giftStory || ""),
    message: String(outputs.message || "ほんの気持ちですが、どうぞ。"),
    returnProbability: Number(outputs.returnProbability) || 0.3,
    expectedMultiplier: Number(outputs.expectedMultiplier) || 0.5,
    questions: Array.isArray(outputs.questions)
      ? outputs.questions.map(String)
      : [],
    allocatedBudget: Number(outputs.allocatedBudget) || 1500,
  };
}
