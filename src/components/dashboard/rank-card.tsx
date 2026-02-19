"use client";

import { useState } from "react";
import {
  Gift,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Crown,
  Star,
  Heart,
} from "lucide-react";
import type { AnalyzedTarget, Rank } from "@/lib/types";
import { SUCCESS_TYPE_CONFIG } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const rankConfig: Record<
  Rank,
  { color: string; bg: string; border: string; badge: string; icon: React.ReactNode; label: string }
> = {
  S: {
    color: "text-rank-s",
    bg: "bg-rose-50",
    border: "border-rank-s/30",
    badge: "bg-rose-100 text-rank-s hover:bg-rose-100",
    icon: <Crown className="h-4 w-4" />,
    label: "最重要",
  },
  A: {
    color: "text-rank-a",
    bg: "bg-orange-50",
    border: "border-rank-a/30",
    badge: "bg-orange-100 text-rank-a hover:bg-orange-100",
    icon: <Star className="h-4 w-4" />,
    label: "重要",
  },
  B: {
    color: "text-rank-b",
    bg: "bg-blue-50",
    border: "border-rank-b/30",
    badge: "bg-blue-100 text-rank-b hover:bg-blue-100",
    icon: <Heart className="h-4 w-4" />,
    label: "標準",
  },
  C: {
    color: "text-rank-c",
    bg: "bg-gray-50",
    border: "border-rank-c/30",
    badge: "bg-gray-100 text-rank-c hover:bg-gray-100",
    icon: <Gift className="h-4 w-4" />,
    label: "義理",
  },
};

function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function RankCard({ target }: { target: AnalyzedTarget }) {
  const [expanded, setExpanded] = useState(false);
  const config = rankConfig[target.rank];
  const stConfig = SUCCESS_TYPE_CONFIG[target.successType];

  return (
    <Card className={cn("border-2 transition-all hover:shadow-md", config.border, config.bg)}>
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-xl bg-white shadow-sm font-extrabold text-lg",
                config.color
              )}
            >
              {target.rank}
            </div>
            <div>
              <h3 className="font-bold text-base">{target.name}</h3>
              <p className="text-xs text-muted-foreground">
                {target.relationship} / {config.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("font-bold text-lg", config.color)}>
              {formatCurrency(target.allocatedBudget)}
            </p>
            <p className="text-xs text-muted-foreground">配分予算</p>
          </div>
        </div>

        {/* Success type badge */}
        <Badge variant="outline" className={cn("mb-3 gap-1 text-xs", stConfig.color)}>
          <span>{stConfig.emoji}</span>
          {target.successType}
        </Badge>

        <p className="text-sm text-muted-foreground mb-3">
          {target.rankReason}
        </p>

        {/* Score breakdown bars */}
        <Card className="bg-white/70 border-0 shadow-none mb-3">
          <CardContent className="p-3 space-y-1.5">
            <ScoreBar label="ROI" value={target.scores.roi} />
            <ScoreBar label="関係性" value={target.scores.relationship} />
            <ScoreBar label="感情" value={target.scores.emotion} />
            <Separator className="my-1.5" />
            <div className="flex items-center gap-2 text-xs">
              <span className="w-12 font-semibold shrink-0">総合</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", {
                    "bg-rank-s": target.rank === "S",
                    "bg-rank-a": target.rank === "A",
                    "bg-rank-b": target.rank === "B",
                    "bg-rank-c": target.rank === "C",
                  })}
                  style={{ width: `${target.scores.total}%` }}
                />
              </div>
              <span className="w-8 text-right font-bold tabular-nums">
                {target.scores.total}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Gift suggestion */}
        <Card className="bg-white/70 border-0 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gift className={cn("h-4 w-4", config.color)} />
              <span className="text-sm font-semibold">ギフト提案</span>
            </div>
            <p className="text-sm font-medium">
              {target.giftSuggestion.item}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(target.giftSuggestion.price)} —{" "}
              {target.giftSuggestion.reason}
            </p>
          </CardContent>
        </Card>

        <Separator className="my-3" />

        {/* ROI */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-muted-foreground">回収確率:</span>
            <span className="font-semibold">
              {Math.round(target.roiPrediction.returnProbability * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">期待倍率:</span>
            <span className="font-semibold">
              {target.roiPrediction.expectedMultiplier}x
            </span>
          </div>
        </div>

        {/* Expand for message */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full justify-between text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            メッセージ文面
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>

        {expanded && (
          <Card className="mt-2 border shadow-none">
            <CardContent className="p-4">
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {target.message}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
