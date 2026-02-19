"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TargetForm } from "@/components/target-form";
import type { TargetFormValues } from "@/lib/schema";

const DEFAULT_VALUES: TargetFormValues = {
  name: "",
  gender: "未回答",
  ageGroup: "30代",
  relationship: "同僚",
  benefitType: "無形",
  personality: [],
  preferences: [],
  recentInterests: "",
  giftReaction: "不明",
  relationshipGoal: "現状維持",
  emotionalPriority: 3,
  giriAwareness: "不明",
  returnTendency: "不明",
  gaveLastYear: false,
  receivedReturn: false,
  returnValue: null,
  gaveYearBefore: false,
  receivedReturnYearBefore: false,
  memo: "",
  budget: 2000,
};

export default function NewTargetPage() {
  const router = useRouter();

  async function handleSubmit(values: TargetFormValues) {
    const res = await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("保存に失敗しました");
    const target = await res.json();

    const analyzeRes = await fetch(`/api/targets/${target.id}/analyze`, {
      method: "POST",
    });
    if (!analyzeRes.ok) throw new Error("分析に失敗しました");

    router.push(`/targets/${target.id}`);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/targets">
              <ArrowLeft className="h-4 w-4" />
              一覧に戻る
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold tracking-tight">ValenTactics</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">対象者を登録</h1>
        <p className="text-muted-foreground mb-8">
          ステップ形式で情報を入力し、AI分析を実行します
        </p>

        <TargetForm
          defaultValues={DEFAULT_VALUES}
          onSubmit={handleSubmit}
          mode="create"
        />
      </main>
    </div>
  );
}
