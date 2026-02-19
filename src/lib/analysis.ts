import type {
  Rank,
  ScoreBreakdown,
  GiftSuggestion,
  RoiPrediction,
  BenefitType,
  EmotionalPriority,
  Relationship,
  RelationshipGoal,
  Preference,
  Personality,
  ReturnTendency,
  GiftReaction,
  RecipientAction,
} from "./types";

export interface TargetInput {
  name: string;
  relationship: Relationship;
  benefitType: BenefitType;

  // 相手の情報
  personality: Personality[];
  preferences: Preference[];
  recentInterests: string;
  giftReaction: GiftReaction;

  // 相手の行動（客観的親密度）
  recipientActions: RecipientAction[];
  recentEpisodes: string;

  // 関係性 & 過去データ
  relationshipGoal: RelationshipGoal;
  emotionalPriority: EmotionalPriority;
  giriAwareness: string;
  returnTendency: ReturnTendency;
  gaveLastYear: boolean;
  receivedReturn: boolean;
  returnValue: number | null;
  gaveYearBefore: boolean;
  receivedReturnYearBefore: boolean;

  budget: number;
  memo: string;
}

export interface AnalysisOutput {
  scores: ScoreBreakdown;
  rank: Rank;
  rankReason: string;
  giftSuggestion: GiftSuggestion;
  message: string;
  roiPrediction: RoiPrediction;
  questions: string[];
  allocatedBudget: number;
}

// ═══════════════════════════════════════════════
//  共通軸: 親密度 (0〜100)
//  「相手の行動（客観的事実）」のみで測る
//  ※ 関係性ラベル・目標・重要度・性格・好みは一切影響しない
// ═══════════════════════════════════════════════

const ACTION_WEIGHTS: Record<RecipientAction, number> = {
  "相手から連絡が来る": 7,
  "プライベートな話題を振られる": 8,
  "食事や飲みに誘われた": 10,
  "仕事やプライベートの相談をされる": 10,
  "誕生日やイベントを覚えてくれる": 9,
  "2人きりの時間を作ってくれる": 12,
  "自分の変化に気づいてくれる": 8,
  "過去の会話内容を覚えている": 7,
  "弱みや愚痴を見せてくれる": 10,
};

function calcIntimacy(t: TargetInput): number {
  let score = 5;

  // ── 行動指標のみで親密度を測る ──
  for (const action of t.recipientActions) {
    score += ACTION_WEIGHTS[action];
  }

  // Dify LLM ではエピソードの内容を評価して 0〜20pt を加算する。
  // ローカルフォールバックでは内容評価不可のため、存在有無のみで控えめに加点。
  if (t.recentEpisodes.length > 10) score += 5;

  // 過去の双方向やりとり（相手が返してきた = 相手側の行動事実）
  if (t.gaveLastYear && t.receivedReturn) score += 3;
  if (t.gaveYearBefore && t.receivedReturnYearBefore) score += 2;

  return clamp(score, 0, 100);
}

// ═══════════════════════════════════════════════
//  有形軸: ROI (0〜100)
//  過去データ + 相手のお返し傾向で算出
// ═══════════════════════════════════════════════
function calcRoi(t: TargetInput): number {
  let base: number;
  const returnVal = t.returnValue ?? 0;

  if (t.gaveLastYear && t.receivedReturn) {
    if (returnVal <= 0) base = rand(50, 60);
    else {
      const mult = returnVal / Math.max(t.budget, 500);
      if (mult >= 3) base = rand(90, 100);
      else if (mult >= 2) base = rand(80, 90);
      else if (mult >= 1) base = rand(65, 80);
      else base = rand(50, 65);
    }
  } else if (t.gaveLastYear && !t.receivedReturn) {
    base = t.gaveYearBefore && !t.receivedReturnYearBefore ? rand(0, 15) : rand(15, 30);
  } else if (t.gaveYearBefore && t.receivedReturnYearBefore) {
    base = rand(40, 55);
  } else {
    base = rand(25, 45);
  }

  // 相手のお返し傾向で補正
  const tendencyMod: Record<ReturnTendency, number> = {
    "律儀に返す": 18,
    "気分次第": 0,
    "返さないタイプ": -20,
    "不明": 0,
  };
  base += tendencyMod[t.returnTendency];

  return clamp(base, 0, 100);
}

// ═══════════════════════════════════════════════
//  無形軸: 好感度 / アフィニティ (0〜100)
//  ローカルフォールバック: 客観的シグナルのみで簡易推定
//  ※ 性格・好み・関心事・ギフト反応はスコアに影響しない
//    （suggestGift / buildStory でのみ使用）
//  Dify LLM では性質を含む全データを包括的に評価する
// ═══════════════════════════════════════════════
function calcAffinity(t: TargetInput): number {
  let score = 15;

  // ── 行動指標: 相手が好意的ならギフトの効果も高い ──
  const actionCount = t.recipientActions.length;
  if (actionCount >= 6) score += 35;
  else if (actionCount >= 4) score += 25;
  else if (actionCount >= 2) score += 15;
  else if (actionCount >= 1) score += 8;

  // ── エピソード: 具体的なやりとりがある = 戦略の手がかりがある ──
  if (t.recentEpisodes.length > 30) score += 20;
  else if (t.recentEpisodes.length > 10) score += 12;

  // ── 過去のギフト交換実績: 成功体験がある = 再現可能性が高い ──
  if (t.gaveLastYear && t.receivedReturn) score += 15;
  else if (t.gaveLastYear) score += 5;
  if (t.gaveYearBefore && t.receivedReturnYearBefore) score += 8;

  return clamp(score, 0, 100);
}

// ═══════════════════════════════════════════════
//  総合スコア（有形 / 無形で重み分岐）
// ═══════════════════════════════════════════════
function calcTotal(intimacy: number, roi: number, affinity: number, bt: BenefitType): number {
  if (bt === "有形") {
    return Math.round(intimacy * 0.25 + roi * 0.55 + affinity * 0.20);
  }
  return Math.round(intimacy * 0.30 + roi * 0.15 + affinity * 0.55);
}

function determineRank(total: number): Rank {
  if (total >= 80) return "S";
  if (total >= 60) return "A";
  if (total >= 40) return "B";
  return "C";
}

function buildRankReason(rank: Rank, scores: ScoreBreakdown, t: TargetInput): string {
  const parts: string[] = [];

  if (t.benefitType === "有形") {
    if (scores.roi >= 70) parts.push("ROI実績が高い");
    else if (scores.roi <= 30) parts.push("ROI実績が低い");
    if (scores.intimacy >= 70) parts.push("相手からの好意的行動が多い");
  } else {
    if (scores.affinity >= 70) parts.push("ギフト戦略の効果が高い見込み");
    else if (scores.affinity <= 30) parts.push("ギフト最適化の手がかりが不足");
    if (scores.intimacy >= 70) parts.push("深い関係性を活かせる");
  }

  if (t.recipientActions.length >= 4) parts.push("相手の好意的行動が多い");
  else if (t.recipientActions.length === 0) parts.push("相手の行動データが不足");
  if (t.returnTendency === "律儀に返す") parts.push("お返し期待度が高い");
  if (t.relationshipGoal === "距離を置きたい") parts.push("距離を置きたい意向");
  if (parts.length === 0) parts.push("バランス型");

  const prefix: Record<Rank, string> = {
    S: "最優先対象",
    A: "重要対象",
    B: "標準対応",
    C: "最小限/見送り検討",
  };
  return `${prefix[rank]}: ${parts.slice(0, 3).join("、")}`;
}

// ═══════════════════════════════════════════════
//  最大化に近づくための質問生成
//  = 対象者について「何を深掘りすれば」分析精度・実利益が上がるか
// ═══════════════════════════════════════════════
function generateQuestions(t: TargetInput, scores: ScoreBreakdown): string[] {
  const qs: string[] = [];

  // ── 行動指標の欠損（最優先で問う） ──
  if (t.recipientActions.length === 0) {
    qs.push("相手があなたに対してどんな行動をとっているか振り返ってみてください。連絡が来る、相談される、誘われるなどの事実があると親密度の精度が大幅に上がります。");
  } else if (t.recipientActions.length <= 2) {
    qs.push("行動指標がまだ少なめです。「信頼」「優先度」「興味」のカテゴリでも当てはまるものがないか確認してみてください。");
  }

  // ── 性格の欠損 ──
  if (t.personality.length === 0) {
    qs.push("この人はどんな性格ですか？（几帳面・おおらか・こだわり強い・社交的 etc.）性格がわかるとギフト戦略が大きく変わります。");
  }

  // ── 好みタグの欠損 ──
  if (t.preferences.length === 0) {
    qs.push("この人の好きな食べ物・飲み物・趣味を調べてみてください。好みタグが増えるとギフト提案の精度が大きく上がります。");
  } else if (t.preferences.length <= 3) {
    qs.push("好みの情報がまだ少なめです。味覚・ライフスタイル・価値観のカテゴリで深掘りできると分析精度が上がります。");
  }

  // ── 最近の関心事の欠損 ──
  if (t.recentInterests.length === 0) {
    qs.push("この人が最近ハマっていること、欲しがっていたもの、話題にしていたことを探ってみてください。ギフト提案の個別化に直結します。");
  }

  // ── ギフト反応の欠損 ──
  if (t.giftReaction === "不明") {
    qs.push("この人がプレゼントをもらったとき、どんな反応をするタイプですか？（素直に喜ぶ/控えめ/恐縮する）渡し方やストーリーの調整に使えます。");
  }

  if (t.benefitType === "有形") {
    // ── お返し傾向の欠損 ──
    if (t.returnTendency === "不明") {
      qs.push("この人は義理チョコにお返しするタイプですか？周囲にそれとなく聞いてみてください。ROI予測の精度が大幅に上がります。");
    }

    if (t.gaveLastYear && t.receivedReturn && (t.returnValue === null || t.returnValue === 0)) {
      qs.push("去年のお返しの金額を思い出せますか？具体的な金額がわかるとROI予測が正確になります。");
    }

    if (t.gaveLastYear && !t.receivedReturn) {
      qs.push("去年お返しがなかった理由を探ってみてください。「忘れていただけ」なら回収の可能性あり、「不要と思われた」なら撤退の材料になります。");
    }

    if (!t.gaveLastYear && !t.gaveYearBefore && t.returnTendency === "不明") {
      qs.push("この人が過去にバレンタインのお返しをしているか、周囲に聞いてみてください。お返し傾向がわかるとROI予測が可能になります。");
    }
  } else {
    if (t.relationshipGoal === "深めたい" && t.recentInterests.length === 0) {
      qs.push("関係を深めたいなら、この人が最近喜んでいたこと・感動していたことを探ってみてください。ストーリーに織り込めます。");
    }

    if (t.relationship === "気になる人" && t.preferences.length < 5) {
      qs.push("この人が普段どんなものを身につけている・使っているか観察してみてください。ブランドの好みやこだわりがわかるとギフト精度が上がります。");
    }

    if (t.relationship === "パートナー" && t.recentInterests.length === 0) {
      qs.push("最近この人が「欲しい」「気になる」と言っていたものはありますか？直近の欲求に合わせたギフトは満足度が跳ね上がります。");
    }
  }

  return qs.slice(0, 5);
}

// ═══════════════════════════════════════════════
//  ギフト提案（相手の情報をフル活用）
// ═══════════════════════════════════════════════
function suggestGift(t: TargetInput, scores: ScoreBreakdown): GiftSuggestion {
  const prefs = t.preferences;
  const b = t.budget;
  let item: string;
  let price: number;
  let reason: string;
  let story = "";

  if (b >= 3000) {
    if (prefs.includes("お酒好き"))          { item = "プレミアムクラフトビールセット"; price = Math.min(b, 3500); reason = "お酒好きに喜ばれる特別感"; }
    else if (prefs.includes("ブランド志向")) { item = "ゴディバ アソートメント"; price = Math.min(b, 4000); reason = "ブランド志向に合致"; }
    else if (prefs.includes("コーヒー好き")) { item = "スペシャルティコーヒー豆セット"; price = Math.min(b, 3500); reason = "こだわりのコーヒー好きに最適"; }
    else if (prefs.includes("ガジェット好き")) { item = "高機能USBデスクウォーマー"; price = Math.min(b, 3500); reason = "ガジェット好きに刺さる実用ギフト"; }
    else if (prefs.includes("グルメ"))       { item = "名店のスイーツ詰め合わせ"; price = Math.min(b, 4000); reason = "グルメも納得の逸品"; }
    else if (prefs.includes("読書家"))       { item = "高級ブックカバー + チョコセット"; price = Math.min(b, 3500); reason = "読書家に嬉しい実用+甘さ"; }
    else                                     { item = "高級チョコレートアソート"; price = Math.min(b, 3500); reason = "定番で安定感のある選択"; }
  } else if (b >= 1500) {
    if (prefs.includes("甘党"))              { item = "パティスリー ボンボンショコラ"; price = Math.min(b, 2000); reason = "甘党に嬉しい本格派"; }
    else if (prefs.includes("健康志向"))     { item = "オーガニック チョコ & ナッツ"; price = Math.min(b, 1800); reason = "健康志向でも安心"; }
    else if (prefs.includes("紅茶好き"))     { item = "TWG紅茶ティーバッグセット"; price = Math.min(b, 2000); reason = "紅茶好きに喜ばれるブランド"; }
    else if (prefs.includes("和菓子派"))     { item = "老舗の生チョコ羊羹"; price = Math.min(b, 1800); reason = "和菓子好きにも合うチョコ"; }
    else if (prefs.includes("コスパ重視"))   { item = "話題のBean to Bar チョコ"; price = Math.min(b, 1500); reason = "価格以上の価値を感じるブランド"; }
    else if (prefs.includes("実用的なもの好き")) { item = "ハンドクリーム & チョコセット"; price = Math.min(b, 1800); reason = "実用+気持ちのバランスギフト"; }
    else                                     { item = "焼き菓子アソート"; price = Math.min(b, 1800); reason = "万人受けする安心の選択"; }
  } else {
    if (prefs.includes("コーヒー好き"))      { item = "ドリップバッグコーヒー 5P"; price = Math.min(b, 800); reason = "手軽で喜ばれるコーヒーギフト"; }
    else if (prefs.includes("甘党"))         { item = "キットカット ショコラトリー"; price = Math.min(b, 500); reason = "気軽に渡せるチョコ"; }
    else if (prefs.includes("辛党"))         { item = "柿の種チョコ アソート"; price = Math.min(b, 500); reason = "辛党でも楽しめるチョコ系スナック"; }
    else                                     { item = "ブラックサンダー 義理チョコパック"; price = Math.min(b, 300); reason = "義理チョコの王道"; }
  }

  // サプライズ好きなら特別感をプラス
  if (prefs.includes("サプライズ好き")) {
    reason += "（サプライズ演出を添えると効果倍増）";
  }

  if (t.benefitType === "無形") {
    story = buildStory(t, item);
  }

  return { item, price, reason, story };
}

function buildStory(t: TargetInput, giftItem: string): string {
  const name = t.name;
  const rel = t.relationship;
  const reaction = t.giftReaction;

  // ギフト反応に合わせてトーン調整
  let closingHint = "";
  if (reaction === "恐縮するタイプ") {
    closingHint = "\n※ 恐縮させないよう、さりげなく渡すのがベスト。「みんなに配ってるよ」と添えると安心。";
  } else if (reaction === "控えめに受け取る") {
    closingHint = "\n※ 控えめな人なので、軽いトーンで渡すと受け取りやすい。";
  }

  // 最近の関心事があればストーリーに織り込む
  const interestHook = t.recentInterests.length > 5
    ? `\n「${t.recentInterests.slice(0, 40)}」に最近ハマっていると聞いて、この人のことをもっと知りたいと思った——`
    : "";

  // エピソードがあればストーリーに織り込む
  const episodeHook = t.recentEpisodes.length > 10
    ? `\n最近のこと——${t.recentEpisodes.slice(0, 60)}——を思い出すと、この人との距離感がわかる。`
    : "";

  if (rel === "パートナー") {
    return `「${giftItem}」を選んだのは、${name}がいつも頑張っている姿を見ているから。${interestHook}${episodeHook}`
      + `\n特別な日じゃなくても感謝を伝えたい——そんな気持ちを、この一箱に込めて。`
      + `\n二人でゆっくり味わう時間が、いちばんのプレゼントになるはず。${closingHint}`;
  }
  if (rel === "気になる人") {
    return `ふと${name}のことを思い出したとき、「${giftItem}」が目に留まった。${interestHook}${episodeHook}`
      + `\n"これ、絶対好きそう"——そう思えるのは、ちゃんと見ているから。`
      + `\n大げさじゃなく、でも気持ちが伝わるように。そんな距離感で渡してみて。${closingHint}`;
  }
  if (rel === "上司") {
    return `日頃の感謝を形にしたくて「${giftItem}」を選びました。${interestHook}${episodeHook}`
      + `\n${name}のデスクで一息つくとき、ふっと笑顔になってもらえたら嬉しい。`
      + `\nさりげなく渡すのがポイント。"いつもありがとうございます"の一言を添えて。${closingHint}`;
  }
  if (rel === "友人") {
    return `${name}とは気を遣わない仲だけど、だからこそ「${giftItem}」で少しだけ驚かせたい。${interestHook}${episodeHook}`
      + `\n"え、わざわざ？" "いや、なんとなく" ——このゆるい温度感が、友達のいいところ。${closingHint}`;
  }
  if (rel === "同僚") {
    return `毎日一緒に働く${name}に、「${giftItem}」でささやかな感謝を。${interestHook}${episodeHook}`
      + `\n忙しい午後のブレイクタイムに"お疲れさま"と一緒に渡すと、チームの空気がちょっと和むかも。${closingHint}`;
  }
  return `${name}への「${giftItem}」。ほんの気持ちだけど、受け取ったときの表情を想像して選んだ一品。${interestHook}${episodeHook}${closingHint}`;
}

// ═══════════════════════════════════════════════
//  メッセージ生成
// ═══════════════════════════════════════════════
function generateMessage(t: TargetInput): string {
  if (t.relationship === "パートナー")
    return "いつも本当にありがとう。\nあなたがいてくれることが、何よりの幸せです。\n日頃の感謝を込めて。";
  if (t.relationship === "気になる人") {
    if (t.relationshipGoal === "深めたい")
      return "いつも楽しい時間をありがとうございます。\nほんの気持ちですが、受け取っていただけたら嬉しいです。";
    return "日頃のお礼を込めて。\n気に入っていただけたら嬉しいです。";
  }
  if (t.relationship === "上司")
    return "いつもご指導いただきありがとうございます。\n日頃の感謝の気持ちを込めて、ささやかですがお受け取りください。";
  if (t.relationship === "同僚")
    return "いつもお疲れさま！\n日頃の感謝を込めて。一緒に頑張ろう！";
  if (t.relationship === "友人")
    return "いつもありがとう！\nちょっとしたお礼だけど、良かったらどうぞ。";
  return "ほんの気持ちですが、どうぞ。";
}

// ═══════════════════════════════════════════════
//  メイン分析（1人分）
// ═══════════════════════════════════════════════
export function analyzeTarget(input: TargetInput): AnalysisOutput {
  const intimacy = calcIntimacy(input);
  const roi = calcRoi(input);
  const affinity = calcAffinity(input);
  const total = calcTotal(intimacy, roi, affinity, input.benefitType);
  const rank = determineRank(total);
  const scores: ScoreBreakdown = { intimacy, roi, affinity, total };

  const gift = suggestGift(input, scores);
  const message = generateMessage(input);
  const questions = generateQuestions(input, scores);

  const returnProb = input.receivedReturn
    ? Math.min(0.95, 0.5 + roi * 0.004)
    : Math.max(0.05, roi * 0.005);
  const expectedMult = input.receivedReturn
    ? 1.0 + (input.returnValue ?? 1000) / 2000
    : 0.3 + intimacy * 0.008;

  return {
    scores,
    rank,
    rankReason: buildRankReason(rank, scores, input),
    giftSuggestion: gift,
    message,
    roiPrediction: {
      returnProbability: Math.round(returnProb * 100) / 100,
      expectedMultiplier: Math.round(expectedMult * 10) / 10,
    },
    questions,
    allocatedBudget: input.budget,
  };
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
