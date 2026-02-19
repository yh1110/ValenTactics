"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { AnalyzedTarget, Rank } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const RANK_COLORS: Record<Rank, string> = {
  S: "#e11d48",
  A: "#f97316",
  B: "#3b82f6",
  C: "#6b7280",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      probability: number;
      multiplier: number;
      budget: number;
      rank: Rank;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold">{d.name}</p>
      <p>
        回収確率: <strong>{Math.round(d.probability * 100)}%</strong>
      </p>
      <p>
        期待倍率: <strong>{d.multiplier}x</strong>
      </p>
      <p>
        投資: <strong>{formatCurrency(d.budget)}</strong>
      </p>
      <p>
        期待リターン:{" "}
        <strong>
          {formatCurrency(Math.round(d.budget * d.multiplier * d.probability))}
        </strong>
      </p>
    </div>
  );
}

export function RoiSummary({ targets }: { targets: AnalyzedTarget[] }) {
  const data = targets.map((t) => ({
    name: t.name,
    probability: t.roiPrediction.returnProbability,
    multiplier: t.roiPrediction.expectedMultiplier,
    budget: t.allocatedBudget,
    expectedReturn: Math.round(
      t.allocatedBudget *
        t.roiPrediction.expectedMultiplier *
        t.roiPrediction.returnProbability
    ),
    rank: t.rank,
  }));

  const totalInvestment = targets.reduce((s, t) => s + t.allocatedBudget, 0);
  const totalExpectedReturn = data.reduce((s, d) => s + d.expectedReturn, 0);
  const overallROI =
    totalInvestment > 0
      ? Math.round((totalExpectedReturn / totalInvestment) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ROI予測（ホワイトデー）</CardTitle>
        <CardDescription>
          回収確率 × 期待倍率から期待リターンを算出
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Card className="border-0 shadow-none bg-muted">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">総投資</p>
              <p className="font-bold text-sm">
                {formatCurrency(totalInvestment)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-emerald-50">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">期待リターン</p>
              <p className="font-bold text-sm text-emerald-600">
                {formatCurrency(totalExpectedReturn)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-amber-50">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">総合ROI</p>
              <p className="font-bold text-sm text-amber-600">{overallROI}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `¥${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="expectedReturn" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={RANK_COLORS[entry.rank]}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
