import type {
  Target,
  AnalyzedTarget,
  AnalysisResult,
  Rank,
  SuccessType,
  ScoreBreakdown,
  GiftSuggestion,
  EmotionalPriority,
} from "./types";

// ────────────────────────────────────────────
// 軸① ROIスコア（0〜100）
// ────────────────────────────────────────────
function calcRoiScore(t: Target): number {
  const investAmount = 1000;
  const returnVal = t.returnValue ?? 0;
  const multiplier = investAmount > 0 && returnVal > 0 ? returnVal / investAmount : 0;

  if (t.gaveLastYear && t.receivedReturn) {
    if (multiplier >= 2) return randomInRange(90, 100);
    if (multiplier >= 1) return randomInRange(70, 89);
    return randomInRange(50, 69);
  }

  if (!t.gaveLastYear) {
    return 50;
  }

  // 去年渡したがお返しなし
  if (t.gaveYearBefore && !t.receivedReturnYearBefore) {
    return randomInRange(0, 29);
  }
  return randomInRange(30, 49);
}

// ────────────────────────────────────────────
// 軸② 関係性スコア（0〜100）
// ────────────────────────────────────────────
function calcRelationshipScore(t: Target): number {
  const goal = t.relationshipGoal;
  const rel = t.relationship;

  if (goal === "距離を置きたい") return randomInRange(0, 29);

  if (goal === "深めたい") {
    if (rel === "気になる人" || rel === "パートナー") return randomInRange(90, 100);
    if (rel === "上司") return randomInRange(80, 95);
    return randomInRange(70, 89);
  }

  if (goal === "現状維持") {
    if (rel === "上司" || rel === "同僚") return randomInRange(60, 79);
    return randomInRange(50, 69);
  }

  // 礼儀として
  return randomInRange(30, 59);
}

// ────────────────────────────────────────────
// 軸③ 感情スコア（0〜100）
// ────────────────────────────────────────────
function calcEmotionScore(ep: EmotionalPriority): number {
  const map: Record<EmotionalPriority, number> = {
    5: 100,
    4: 80,
    3: 60,
    2: 40,
    1: 20,
  };
  return map[ep];
}

// ────────────────────────────────────────────
// 総合スコア（加重平均）
// ────────────────────────────────────────────
function calcTotalScore(roi: number, rel: number, emo: number, ep: EmotionalPriority): number {
  if (ep <= 2) {
    return Math.round(roi * 0.5 + rel * 0.3 + emo * 0.2);
  }
  if (ep === 3) {
    return Math.round(roi * 0.3 + rel * 0.4 + emo * 0.3);
  }
  // ep 4-5
  return Math.round(roi * 0.1 + rel * 0.3 + emo * 0.6);
}

// ────────────────────────────────────────────
// ランク判定
// ────────────────────────────────────────────
function determineRank(total: number): Rank {
  if (total >= 80) return "S";
  if (total >= 60) return "A";
  if (total >= 40) return "B";
  return "C";
}

function rankReason(rank: Rank, scores: ScoreBreakdown, t: Target): string {
  const reasons: string[] = [];

  if (scores.roi >= 80) reasons.push("高いROI実績");
  else if (scores.roi <= 30) reasons.push("ROI実績が低い");

  if (scores.relationship >= 80) reasons.push(`${t.relationship}との関係を深めたい意向`);
  else if (scores.relationship <= 30) reasons.push("関係性の戦略的重要度が低い");

  if (t.emotionalPriority >= 4) reasons.push("感情的に重要な相手");
  else if (t.emotionalPriority <= 2) reasons.push("義理寄りの位置づけ");

  if (rank === "S") return `最優先対象: ${reasons.join("、")}`;
  if (rank === "A") return `重要対象: ${reasons.join("、")}`;
  if (rank === "B") return `標準対応: ${reasons.join("、")}`;
  return `最小限/見送り検討: ${reasons.join("、")}`;
}

// ────────────────────────────────────────────
// 成功タイプ判定
// ────────────────────────────────────────────
function determineSuccessType(t: Target, scores: ScoreBreakdown): SuccessType {
  const hasReturn = t.receivedReturn;
  const returnVal = t.returnValue ?? 0;
  const multiplier = returnVal > 0 ? returnVal / 1000 : 0;

  if (t.emotionalPriority >= 4 && hasReturn) return "完全成功";
  if (t.emotionalPriority >= 4) return "感情型成功";
  if (hasReturn && multiplier >= 1.0) return "投資型成功";
  if (t.relationshipGoal === "深めたい" && scores.relationship >= 70) return "関係構築型成功";
  if (t.emotionalPriority === 3 && !hasReturn) return "要見直し";
  if (t.emotionalPriority <= 2 && !hasReturn) return "損切り推奨";

  return "要見直し";
}

// ────────────────────────────────────────────
// 予算配分（ランク別 S:40%, A:30%, B:20%, C:10%）
// ────────────────────────────────────────────
const RANK_ALLOC_RATIO: Record<Rank, number> = { S: 0.4, A: 0.3, B: 0.2, C: 0.1 };

function allocateBudgets(
  targets: Array<{ rank: Rank; emotionalPriority: EmotionalPriority; id: string }>,
  totalBudget: number
): Record<string, number> {
  const rankGroups: Record<Rank, string[]> = { S: [], A: [], B: [], C: [] };
  for (const t of targets) {
    let effectiveRank = t.rank;
    if (t.emotionalPriority === 5 && effectiveRank !== "S") {
      const upgrade: Record<Rank, Rank> = { A: "S", B: "A", C: "B", S: "S" };
      effectiveRank = upgrade[effectiveRank];
    }
    rankGroups[effectiveRank].push(t.id);
  }

  const activeRanks = (Object.keys(rankGroups) as Rank[]).filter(
    (r) => rankGroups[r].length > 0
  );

  let totalRatio = activeRanks.reduce((s, r) => s + RANK_ALLOC_RATIO[r], 0);
  if (totalRatio === 0) totalRatio = 1;

  const allocations: Record<string, number> = {};
  for (const rank of activeRanks) {
    const groupBudget = Math.round(
      (RANK_ALLOC_RATIO[rank] / totalRatio) * totalBudget
    );
    const perPerson = Math.round(groupBudget / rankGroups[rank].length);
    for (const id of rankGroups[rank]) {
      allocations[id] = perPerson;
    }
  }

  // 感情スコア補正: emotionalPriority >= 4 かつ Cランクの場合、最低予算保証
  const minBudgetForHighEmo = Math.round(totalBudget * 0.05);
  for (const t of targets) {
    if (t.emotionalPriority >= 4 && t.rank === "C") {
      if (allocations[t.id] < minBudgetForHighEmo) {
        allocations[t.id] = minBudgetForHighEmo;
      }
    }
  }

  return allocations;
}

// ────────────────────────────────────────────
// ギフト提案
// ────────────────────────────────────────────
function suggestGift(t: Target, budget: number): GiftSuggestion {
  const prefs = t.preferences;

  if (budget >= 3000) {
    if (prefs.includes("お酒好き"))
      return { item: "プレミアムクラフトビールセット", price: Math.min(budget, 3500), reason: "お酒好きに喜ばれる特別感" };
    if (prefs.includes("ブランド志向"))
      return { item: "ゴディバ アソートメント", price: Math.min(budget, 4000), reason: "ブランド志向に合致" };
    if (prefs.includes("コーヒー好き"))
      return { item: "スペシャルティコーヒー豆セット", price: Math.min(budget, 3500), reason: "こだわりのコーヒー好きに最適" };
    return { item: "高級チョコレートアソート", price: Math.min(budget, 3500), reason: "定番で安定感のある選択" };
  }

  if (budget >= 1500) {
    if (prefs.includes("甘党"))
      return { item: "パティスリー ボンボンショコラ", price: Math.min(budget, 2000), reason: "甘党に嬉しい本格派" };
    if (prefs.includes("健康志向"))
      return { item: "オーガニック チョコ & ナッツ", price: Math.min(budget, 1800), reason: "健康志向でも安心" };
    if (prefs.includes("紅茶好き"))
      return { item: "TWG紅茶ティーバッグセット", price: Math.min(budget, 2000), reason: "紅茶好きに喜ばれるブランド" };
    if (prefs.includes("和菓子派"))
      return { item: "老舗の生チョコ羊羹", price: Math.min(budget, 1800), reason: "和菓子好きにも合うチョコ" };
    return { item: "焼き菓子アソート", price: Math.min(budget, 1800), reason: "万人受けする安心の選択" };
  }

  if (prefs.includes("コーヒー好き"))
    return { item: "ドリップバッグコーヒー 5P", price: Math.min(budget, 800), reason: "手軽で喜ばれるコーヒーギフト" };
  if (prefs.includes("甘党"))
    return { item: "キットカット ショコラトリー", price: Math.min(budget, 500), reason: "気軽に渡せる義理チョコ" };
  return { item: "ブラックサンダー 義理チョコパック", price: Math.min(budget, 300), reason: "義理チョコの王道" };
}

// ────────────────────────────────────────────
// メッセージ生成
// ────────────────────────────────────────────
function generateMessage(t: Target): string {
  const rel = t.relationship;
  const goal = t.relationshipGoal;

  if (rel === "パートナー") {
    return "いつも本当にありがとう。\nあなたがいてくれることが、何よりの幸せです。\n日頃の感謝を込めて。";
  }
  if (rel === "気になる人") {
    if (goal === "深めたい") {
      return "いつも楽しい時間をありがとうございます。\nほんの気持ちですが、受け取っていただけたら嬉しいです。";
    }
    return "日頃のお礼を込めて。\n気に入っていただけたら嬉しいです。";
  }
  if (rel === "上司") {
    return "いつもご指導いただきありがとうございます。\n日頃の感謝の気持ちを込めて、ささやかですがお受け取りください。";
  }
  if (rel === "同僚") {
    return "いつもお疲れさま！\n日頃の感謝を込めて。一緒に頑張ろう！";
  }
  if (rel === "友人") {
    return "いつもありがとう！\nちょっとしたお礼だけど、良かったらどうぞ。";
  }
  return "ほんの気持ちですが、どうぞ。";
}

// ────────────────────────────────────────────
// タイムライン生成
// ────────────────────────────────────────────
function generateTimeline(targets: AnalyzedTarget[]): { date: string; action: string }[] {
  const sTargets = targets.filter((t) => t.rank === "S");
  const aTargets = targets.filter((t) => t.rank === "A");
  const items = [
    { date: "2/1〜2/7", action: "ギフトの購入・手配（オンライン注文の最終期限に注意）" },
    { date: "2/8〜2/10", action: "メッセージカードの準備・手書きメッセージ作成" },
  ];
  if (sTargets.length > 0) {
    items.push({
      date: "2/12",
      action: `Sランク対象者（${sTargets.map((t) => t.name).join("・")}）への渡し方を最終確認`,
    });
  }
  if (aTargets.length > 0) {
    items.push({
      date: "2/13",
      action: `A/Bランク対象者へのギフト最終準備`,
    });
  }
  items.push(
    { date: "2/14", action: "バレンタインデー当日 — 全対象者にギフトを渡す" },
    { date: "2/15〜2/28", action: "反応の記録・関係性の変化を観察" },
    { date: "3/14", action: "ホワイトデー — お返しの有無・内容を記録しROI確定" },
    { date: "3/15〜3/31", action: "成功タイプの最終判定・来年への振り返り" }
  );
  return items;
}

// ────────────────────────────────────────────
// リスク警告
// ────────────────────────────────────────────
function generateWarnings(targets: Target[], analyzed: AnalyzedTarget[]): string[] {
  const warnings: string[] = [];

  const cutLoss = analyzed.filter((a) => a.successType === "損切り推奨");
  if (cutLoss.length > 0) {
    warnings.push(
      `✂️ ${cutLoss.map((t) => t.name).join("・")}は損切り推奨です。投資を再検討してください。`
    );
  }

  const twoYearNoReturn = targets.filter(
    (t) => t.gaveLastYear && !t.receivedReturn && t.gaveYearBefore && !t.receivedReturnYearBefore
  );
  if (twoYearNoReturn.length > 0) {
    warnings.push(
      `⚠️ ${twoYearNoReturn.map((t) => t.name).join("・")}は2年連続お返しなし。撤退を強く推奨します。`
    );
  }

  const misperceived = targets.filter(
    (t) => t.giriAwareness === "本命と受け取られる可能性あり" && t.emotionalPriority <= 2
  );
  if (misperceived.length > 0) {
    warnings.push(
      `💡 ${misperceived.map((t) => t.name).join("・")}は義理のつもりでも本命と誤解されるリスクがあります。渡し方に注意。`
    );
  }

  const highEmoLowRank = analyzed.filter(
    (a) => a.emotionalPriority >= 4 && (a.rank === "C" || a.rank === "B")
  );
  if (highEmoLowRank.length > 0) {
    warnings.push(
      `💝 ${highEmoLowRank.map((t) => t.name).join("・")}は感情的に重要ですがランクが低めです。予算補正を適用しています。`
    );
  }

  const distanceBut = targets.filter(
    (t) => t.relationshipGoal === "距離を置きたい" && t.gaveLastYear
  );
  if (distanceBut.length > 0) {
    warnings.push(
      `🚫 ${distanceBut.map((t) => t.name).join("・")}は距離を置きたい相手ですが去年渡しています。急に止めるとトラブルの可能性も。`
    );
  }

  return warnings;
}

// ────────────────────────────────────────────
// メインの分析関数
// ────────────────────────────────────────────
export function analyzeTargets(targets: Target[], totalBudget: number): AnalysisResult {
  // 各対象者のスコア算出
  const scored = targets.map((t) => {
    const roi = calcRoiScore(t);
    const relationship = calcRelationshipScore(t);
    const emotion = calcEmotionScore(t.emotionalPriority as EmotionalPriority);
    const total = calcTotalScore(roi, relationship, emotion, t.emotionalPriority as EmotionalPriority);
    const rank = determineRank(total);
    const scores: ScoreBreakdown = { roi, relationship, emotion, total };
    return { target: t, scores, rank };
  });

  // 予算配分
  const budgets = allocateBudgets(
    scored.map((s) => ({
      rank: s.rank,
      emotionalPriority: s.target.emotionalPriority as EmotionalPriority,
      id: s.target.id,
    })),
    totalBudget
  );

  // AnalyzedTarget生成
  const analyzedTargets: AnalyzedTarget[] = scored.map((s) => {
    const budget = budgets[s.target.id] || 0;
    const successType = determineSuccessType(s.target, s.scores);
    const gift = suggestGift(s.target, budget);
    const message = generateMessage(s.target);

    const returnProb =
      s.target.receivedReturn
        ? Math.min(0.95, 0.5 + s.scores.roi * 0.004)
        : Math.max(0.05, s.scores.roi * 0.005);
    const expectedMult =
      s.target.receivedReturn
        ? 1.0 + (s.target.returnValue ?? 1000) / 2000
        : 0.3 + s.scores.relationship * 0.01;

    return {
      id: s.target.id,
      name: s.target.name,
      relationship: s.target.relationship,
      rank: s.rank,
      rankReason: rankReason(s.rank, s.scores, s.target),
      successType,
      scores: s.scores,
      allocatedBudget: budget,
      giftSuggestion: gift,
      message,
      roiPrediction: {
        returnProbability: Math.round(returnProb * 100) / 100,
        expectedMultiplier: Math.round(expectedMult * 10) / 10,
      },
      emotionalPriority: s.target.emotionalPriority as EmotionalPriority,
    };
  });

  // ランクでソート
  const rankValue: Record<Rank, number> = { S: 0, A: 1, B: 2, C: 3 };
  analyzedTargets.sort((a, b) => rankValue[a.rank] - rankValue[b.rank]);

  const timeline = generateTimeline(analyzedTargets);
  const warnings = generateWarnings(targets, analyzedTargets);

  return {
    targets: analyzedTargets,
    timeline,
    warnings,
    totalBudget,
  };
}

// ────────────────────────────────────────────
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
