"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TargetForm } from "@/components/target-form";
import type { TargetFormValues } from "@/schema";
import { updateTargetAndAnalyze } from "@/actions/target";

export default function EditTargetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<TargetFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/targets/${id}`);
        if (!res.ok) { setNotFound(true); return; }
        const t = await res.json();
        setInitialValues({
          name: t.name,
          gender: t.gender,
          ageGroup: t.ageGroup,
          relationship: t.relationship,
          benefitType: t.benefitType,
          personality: t.personality ?? [],
          preferences: t.preferences ?? [],
          recentInterests: t.recentInterests ?? "",
          giftReaction: t.giftReaction ?? "不明",
          recipientActions: t.recipientActions ?? [],
          recentEpisodes: t.recentEpisodes ?? "",
          relationshipGoal: t.relationshipGoal,
          emotionalPriority: t.emotionalPriority,
          giriAwareness: t.giriAwareness,
          returnTendency: t.returnTendency ?? "不明",
          gaveLastYear: t.gaveLastYear,
          receivedReturn: t.receivedReturn,
          returnValue: t.returnValue,
          gaveYearBefore: t.gaveYearBefore,
          receivedReturnYearBefore: t.receivedReturnYearBefore,
          memo: t.memo,
          budget: t.budget,
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(values: TargetFormValues) {
    const result = await updateTargetAndAnalyze(id, values);
    if (!result.success) throw new Error(result.error);
    router.push(`/targets/${id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !initialValues) {
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

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/targets/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              詳細に戻る
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold tracking-tight">ValenTactics</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">{initialValues.name} を編集</h1>
        <p className="text-muted-foreground mb-8">
          情報を修正して保存すると、自動で再分析されます
        </p>

        <TargetForm
          defaultValues={initialValues}
          onSubmit={handleSubmit}
          mode="edit"
        />
      </main>
    </div>
  );
}
