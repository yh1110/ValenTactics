"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { AnalyzedTarget, Rank } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RANK_COLORS: Record<Rank, string> = {
  S: "#e11d48",
  A: "#f97316",
  B: "#3b82f6",
  C: "#6b7280",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; rank: Rank } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold">{data.name}</p>
      <p className="text-muted-foreground">
        {formatCurrency(data.value)} ({data.rank}ランク)
      </p>
    </div>
  );
}

export function BudgetChart({ targets }: { targets: AnalyzedTarget[] }) {
  const data = targets.map((t) => ({
    name: t.name,
    value: t.allocatedBudget,
    rank: t.rank,
  }));

  const rankSummary = targets.reduce(
    (acc, t) => {
      acc[t.rank] = (acc[t.rank] || 0) + t.allocatedBudget;
      return acc;
    },
    {} as Record<Rank, number>
  );

  const rankData = (Object.entries(rankSummary) as [Rank, number][]).map(
    ([rank, value]) => ({
      name: `${rank}ランク`,
      value,
      rank,
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">予算配分</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={RANK_COLORS[entry.rank]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          {rankData.map((r) => (
            <div
              key={r.rank}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: RANK_COLORS[r.rank] }}
                />
                <span>{r.name}</span>
              </div>
              <span className="font-semibold">{formatCurrency(r.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
