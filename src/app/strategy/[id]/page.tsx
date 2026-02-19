"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  Users,
  Wallet,
  Trophy,
  Loader2,
  Plus,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { Strategy, Rank, SuccessType } from "@/lib/types";
import { SUCCESS_TYPE_CONFIG } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { loadStrategy } from "@/lib/store";
import { RankCard } from "@/components/dashboard/rank-card";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { RoiSummary } from "@/components/dashboard/roi-summary";
import { Timeline } from "@/components/dashboard/timeline";
import { Warnings } from "@/components/dashboard/warnings";

const rankOrder: Rank[] = ["S", "A", "B", "C"];

const rankBadgeClass: Record<Rank, string> = {
  S: "bg-rose-100 text-rank-s hover:bg-rose-100",
  A: "bg-orange-100 text-rank-a hover:bg-orange-100",
  B: "bg-blue-100 text-rank-b hover:bg-blue-100",
  C: "bg-gray-100 text-rank-c hover:bg-gray-100",
};

const rankBgClass: Record<Rank, string> = {
  S: "bg-rank-s",
  A: "bg-rank-a",
  B: "bg-rank-b",
  C: "bg-rank-c",
};

export default function StrategyDashboard() {
  const params = useParams();
  const id = params.id as string;
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = loadStrategy(id);
    if (cached) {
      setStrategy(cached);
      setLoading(false);
      return;
    }

    async function fetchStrategy() {
      try {
        const res = await fetch(`/api/strategies/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setStrategy(data);
      } catch {
        setError("戦略データが見つかりませんでした");
      } finally {
        setLoading(false);
      }
    }
    fetchStrategy();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !strategy?.analysisResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">
            {error || "データが見つかりません"}
          </p>
          <Button variant="link" asChild>
            <Link href="/strategy/new">
              <ArrowLeft className="h-4 w-4" />
              新しい戦略を作成する
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const result = strategy.analysisResult;
  const rankCounts = rankOrder.reduce(
    (acc, r) => {
      acc[r] = result.targets.filter((t) => t.rank === r).length;
      return acc;
    },
    {} as Record<Rank, number>
  );

  // 成功タイプ集計
  const successCounts = result.targets.reduce(
    (acc, t) => {
      acc[t.successType] = (acc[t.successType] || 0) + 1;
      return acc;
    },
    {} as Record<SuccessType, number>
  );

  // 平均総合スコア
  const avgScore =
    result.targets.length > 0
      ? Math.round(
          result.targets.reduce((s, t) => s + t.scores.total, 0) /
            result.targets.length
        )
      : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/strategy/new">
              <ArrowLeft className="h-4 w-4" />
              戦略を編集
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold tracking-tight">ValenTactics</span>
          </div>
          <Button size="sm" asChild>
            <Link href="/strategy/new">
              <Plus className="h-4 w-4" />
              新規作成
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            バレンタイン戦略ダッシュボード
          </h1>
          <p className="text-muted-foreground text-sm">
            3軸スコアリング（ROI × 関係性 × 感情）に基づく最適戦略
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">対象人数</span>
              </div>
              <p className="text-2xl font-bold">{result.targets.length}人</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">総予算</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(result.totalBudget)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">ランク分布</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {rankOrder.map((r) =>
                  rankCounts[r] > 0 ? (
                    <Badge key={r} className={rankBadgeClass[r]}>
                      {r}:{rankCounts[r]}
                    </Badge>
                  ) : null
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">平均スコア</span>
              </div>
              <p className="text-2xl font-bold">{avgScore}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">平均予算</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  Math.round(result.totalBudget / result.targets.length)
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Success type summary */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">成功タイプ分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(successCounts) as [SuccessType, number][]).map(
                ([type, count]) => {
                  const cfg = SUCCESS_TYPE_CONFIG[type];
                  return (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn("gap-1.5 py-1.5 px-3 text-sm", cfg.color)}
                    >
                      <span>{cfg.emoji}</span>
                      {type}: {count}人
                    </Badge>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="mb-8">
            <Warnings warnings={result.warnings} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: Rank Cards */}
          <div>
            <h2 className="text-lg font-bold mb-4">ランク別分析結果</h2>
            <div className="space-y-4">
              {rankOrder.map((rank) => {
                const targets = result.targets.filter((t) => t.rank === rank);
                if (targets.length === 0) return null;
                return (
                  <div key={rank}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold text-white",
                          rankBgClass[rank]
                        )}
                      >
                        {rank}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        ランク（{targets.length}人）
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {targets.map((t) => (
                        <RankCard key={t.id} target={t} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Charts & Timeline */}
          <div className="space-y-6">
            <BudgetChart targets={result.targets} />
            <RoiSummary targets={result.targets} />
            <Timeline items={result.timeline} />
          </div>
        </div>
      </main>

      <Separator className="mt-12" />
      <footer className="bg-card py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>ValenTactics — AI職場Hack プロジェクト</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
