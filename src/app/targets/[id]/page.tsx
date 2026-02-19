"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  Loader2,
  Trash2,
  Pencil,
  Gift,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { Rank, BenefitType } from "@/lib/types";
import { RANK_CONFIG, BENEFIT_TYPES } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

interface AnalysisData {
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

interface TargetData {
  id: string;
  name: string;
  gender: string;
  ageGroup: string;
  relationship: string;
  benefitType: string;
  personality: string[];
  preferences: string[];
  recentInterests: string;
  giftReaction: string;
  recipientActions: string[];
  recentEpisodes: string;
  relationshipGoal: string;
  emotionalPriority: number;
  giriAwareness: string;
  returnTendency: string;
  gaveLastYear: boolean;
  receivedReturn: boolean;
  returnValue: number | null;
  gaveYearBefore: boolean;
  receivedReturnYearBefore: boolean;
  memo: string;
  budget: number;
  analysis: AnalysisData | null;
}

function ScoreBar({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-16 text-sm shrink-0", accent ? "font-semibold" : "text-muted-foreground")}>{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", accent ? "bg-primary" : "bg-primary/60")}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn("w-10 text-right tabular-nums text-sm", accent ? "font-extrabold" : "font-bold")}>{value}</span>
    </div>
  );
}

export default function TargetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [target, setTarget] = useState<TargetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  async function fetchTarget() {
    setLoading(true);
    try {
      const res = await fetch(`/api/targets/${id}`);
      if (!res.ok) throw new Error();
      setTarget(await res.json());
    } catch {
      setTarget(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTarget(); }, [id]);

  async function handleDelete() {
    if (!confirm("この対象者を削除しますか？")) return;
    setDeleting(true);
    try {
      await fetch(`/api/targets/${id}`, { method: "DELETE" });
      router.push("/targets");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!target) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">対象者が見つかりません</p>
          <Button variant="link" asChild>
            <Link href="/targets"><ArrowLeft className="h-4 w-4" />一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  const a = target.analysis;
  const rank = (a?.rank || "C") as Rank;
  const rc = RANK_CONFIG[rank];
  const bt = target.benefitType as BenefitType;
  const btConfig = BENEFIT_TYPES.find((b) => b.value === bt);
  const isTangible = bt === "有形";

  const warnings: string[] = [];
  if (target.gaveLastYear && !target.receivedReturn && target.gaveYearBefore && !target.receivedReturnYearBefore)
    warnings.push("2年連続お返しなし。撤退を強く推奨します。");
  if (target.giriAwareness === "本命と受け取られる可能性あり" && target.emotionalPriority <= 2)
    warnings.push("義理のつもりでも本命と誤解されるリスクがあります。");
  if (isTangible && a && a.scoreRoi < 30)
    warnings.push("ROIが低いです。有形利益の最大化は難しい相手かもしれません。");

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/targets"><ArrowLeft className="h-4 w-4" />一覧</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold tracking-tight">ValenTactics</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/targets/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                編集
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          {a && (
            <div className={cn("flex items-center justify-center h-14 w-14 rounded-2xl bg-white shadow-md font-extrabold text-2xl border-2", rc.color, rc.border)}>
              {rank}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{target.name}</h1>
            <p className="text-muted-foreground text-sm">
              {target.relationship} / {target.gender} / {target.ageGroup} / 予算 {formatCurrency(target.budget)}
            </p>
          </div>
          {btConfig && (
            <Badge variant="outline" className="ml-auto gap-1.5 py-1.5 px-3 text-sm">
              <span>{btConfig.emoji}</span>
              {btConfig.label}
            </Badge>
          )}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Alert className="mb-6 border-2 border-amber-300/50 bg-amber-50 [&>svg]:text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-amber-800 font-bold">リスク警告</AlertTitle>
            <AlertDescription>
              <ul className="mt-1 space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {!a ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">まだ分析が実行されていません</p>
              <Button asChild>
                <Link href={`/targets/${id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  編集してAI分析を実行
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">スコア内訳</CardTitle>
                <CardDescription>{a.rankReason}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScoreBar label="親密度" value={a.scoreIntimacy} />
                <ScoreBar
                  label="ROI"
                  value={a.scoreRoi}
                  accent={isTangible}
                />
                <ScoreBar
                  label="好感度"
                  value={a.scoreAffinity}
                  accent={!isTangible}
                />
                <Separator />
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm font-semibold shrink-0">総合</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", {
                        "bg-rank-s": rank === "S",
                        "bg-rank-a": rank === "A",
                        "bg-rank-b": rank === "B",
                        "bg-rank-c": rank === "C",
                      })}
                      style={{ width: `${a.scoreTotal}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-extrabold tabular-nums">{a.scoreTotal}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isTangible
                    ? "重み: 親密度 25% / ROI 55% / 好感度 20%"
                    : "重み: 親密度 30% / ROI 15% / 好感度 55%"}
                </p>
              </CardContent>
            </Card>

            {/* Gift suggestion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gift className={cn("h-5 w-5", rc.color)} />
                  ギフト提案
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-lg">{a.giftItem}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(a.giftPrice)} — {a.giftReason}
                  </p>
                </div>
                {isTangible && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-muted-foreground">回収確率:</span>
                        <span className="font-bold">{Math.round(a.returnProbability * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">期待倍率:</span>
                        <span className="font-bold">{a.expectedMultiplier}x</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Story (intangible only) */}
            {!isTangible && a.giftStory && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-5 w-5 text-pink-500" />
                    渡し方のストーリー
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line leading-relaxed bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-5 border border-pink-100">
                    {a.giftStory}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Questions */}
            {a.questions.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    最大化のためのヒント
                  </CardTitle>
                  <CardDescription>
                    これらに答えると、分析の精度がさらに上がります
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {a.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Message */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  onClick={() => setShowMessage(!showMessage)}
                >
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    メッセージ文面
                  </CardTitle>
                  {showMessage ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </CardHeader>
              {showMessage && (
                <CardContent>
                  <p className="text-sm whitespace-pre-line leading-relaxed bg-muted/50 rounded-lg p-4">
                    {a.message}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* Input summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">入力情報サマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">相手の情報</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">性格</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {target.personality.length > 0 ? target.personality.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                        )) : <span className="text-muted-foreground">未設定</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ギフト反応</p>
                      <p className="font-medium">{target.giftReaction}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">好み</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {target.preferences.length > 0 ? target.preferences.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                        )) : <span className="text-muted-foreground">未設定</span>}
                      </div>
                    </div>
                    {target.recentInterests && (
                      <div className="sm:col-span-2 lg:col-span-4">
                        <p className="text-muted-foreground">最近の関心事</p>
                        <p className="font-medium">{target.recentInterests}</p>
                      </div>
                    )}
                  </div>

                  {target.recipientActions.length > 0 && (
                    <>
                      <Separator />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">相手の行動（客観的指標）</p>
                      <div className="flex flex-wrap gap-1">
                        {target.recipientActions.map((a) => (
                          <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </>
                  )}

                  {target.recentEpisodes && (
                    <>
                      <div>
                        <p className="text-muted-foreground">最近のエピソード</p>
                        <p className="font-medium whitespace-pre-line">{target.recentEpisodes}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">関係性 & 実績</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">目的</p>
                      <p className="font-medium">{btConfig?.emoji} {target.benefitType}利益を最大化</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">関係性の目標</p>
                      <p className="font-medium">{target.relationshipGoal}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">感情的重要度</p>
                      <p className="font-medium">{target.emotionalPriority}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">義理認識</p>
                      <p className="font-medium">{target.giriAwareness}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">お返し傾向</p>
                      <p className="font-medium">{target.returnTendency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">去年</p>
                      <p className="font-medium">{target.gaveLastYear ? "渡した" : "渡してない"} / {target.receivedReturn ? "お返しあり" : "なし"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">一昨年</p>
                      <p className="font-medium">{target.gaveYearBefore ? "渡した" : "渡してない"} / {target.receivedReturnYearBefore ? "お返しあり" : "なし"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">お返し金額</p>
                      <p className="font-medium">{target.returnValue ? formatCurrency(target.returnValue) : "—"}</p>
                    </div>
                  </div>

                  {target.memo && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground">メモ</p>
                        <p className="font-medium">{target.memo}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
