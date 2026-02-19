"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Plus,
  Loader2,
  ArrowRight,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { Rank, BenefitType } from "@/lib/types";
import { RANK_CONFIG, BENEFIT_TYPES } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

interface TargetListItem {
  id: string;
  name: string;
  relationship: string;
  benefitType: string;
  budget: number;
  analysis: {
    rank: string;
    scoreTotal: number;
    giftItem: string;
    giftPrice: number;
    questions: string[];
  } | null;
}

const rankBorder: Record<Rank, string> = {
  S: "border-rank-s/20 hover:border-rank-s/40",
  A: "border-rank-a/20 hover:border-rank-a/40",
  B: "border-rank-b/20 hover:border-rank-b/40",
  C: "border-rank-c/20 hover:border-rank-c/40",
};

export default function TargetsListPage() {
  const [targets, setTargets] = useState<TargetListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/targets")
      .then((r) => r.json())
      .then(setTargets)
      .finally(() => setLoading(false));
  }, []);

  const analyzed = targets.filter((t) => t.analysis);
  const totalBudget = targets.reduce((s, t) => s + t.budget, 0);

  const rankCounts: Record<Rank, number> = { S: 0, A: 0, B: 0, C: 0 };
  analyzed.forEach((t) => {
    const r = t.analysis!.rank as Rank;
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  });

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold tracking-tight">ValenTactics</span>
          </div>
          <Button asChild>
            <Link href="/targets/new">
              <Plus className="h-4 w-4" />
              新規登録
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">対象者一覧</h1>
        <p className="text-muted-foreground mb-6">
          登録した対象者と分析結果を管理します
        </p>

        {targets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground mb-1">登録人数</p>
                <p className="text-2xl font-bold">{targets.length}人</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground mb-1">合計予算</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground mb-1">分析済み</p>
                <p className="text-2xl font-bold">{analyzed.length}/{targets.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground mb-1">ランク分布</p>
                <div className="flex gap-1.5 mt-1">
                  {(["S", "A", "B", "C"] as Rank[]).map((r) =>
                    rankCounts[r] > 0 ? (
                      <Badge key={r} className={cn("text-white text-xs", `bg-rank-${r.toLowerCase()}`)}>{r}:{rankCounts[r]}</Badge>
                    ) : null
                  )}
                  {analyzed.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : targets.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">まだ対象者がいません</p>
              <p className="text-muted-foreground mb-6">
                対象者を登録してAI分析を実行しましょう
              </p>
              <Button asChild>
                <Link href="/targets/new">
                  <Plus className="h-4 w-4" />
                  最初の対象者を登録
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {targets.map((t) => {
              const a = t.analysis;
              const rank = (a?.rank || null) as Rank | null;
              const bt = t.benefitType as BenefitType;
              const btConf = BENEFIT_TYPES.find((b) => b.value === bt);

              return (
                <Link key={t.id} href={`/targets/${t.id}`}>
                  <Card className={cn(
                    "hover:shadow-md transition-all cursor-pointer border-2",
                    rank ? rankBorder[rank] : "hover:border-primary/20"
                  )}>
                    <CardContent className="py-5 flex items-center gap-4">
                      {rank ? (
                        <div className={cn(
                          "flex items-center justify-center h-12 w-12 rounded-xl bg-white shadow-sm font-extrabold text-xl shrink-0 border",
                          RANK_CONFIG[rank].color,
                          RANK_CONFIG[rank].border
                        )}>
                          {rank}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted text-muted-foreground shrink-0 text-xs font-medium">
                          未分析
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-base truncate">{t.name}</p>
                          {btConf && (
                            <Badge variant="outline" className="text-xs gap-1 shrink-0">
                              {btConf.emoji} {bt}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t.relationship} / {formatCurrency(t.budget)}
                          {a ? ` / スコア: ${a.scoreTotal}` : ""}
                        </p>
                      </div>

                      {a && (
                        <div className="hidden sm:block text-right text-sm shrink-0">
                          <p className="font-medium">{a.giftItem}</p>
                          <p className="text-muted-foreground">{formatCurrency(a.giftPrice)}</p>
                        </div>
                      )}

                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
