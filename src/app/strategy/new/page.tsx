"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import {
  Heart,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Database,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import type {
  Target,
  Preference,
  Relationship,
  Gender,
  AgeGroup,
  RelationshipGoal,
  GiriAwareness,
  EmotionalPriority,
} from "@/lib/types";
import {
  RELATIONSHIPS,
  PREFERENCES,
  GENDERS,
  AGE_GROUPS,
  RELATIONSHIP_GOALS,
  GIRI_AWARENESS_OPTIONS,
} from "@/lib/types";
import { strategyFormSchema, type StrategyFormValues } from "@/lib/schema";
import { formatCurrency } from "@/lib/utils";
import { saveStrategy } from "@/lib/store";

const EMOTIONAL_LABELS: Record<EmotionalPriority, string> = {
  1: "1: 完全義理",
  2: "2: 義理寄り",
  3: "3: バランス",
  4: "4: かなり大事",
  5: "5: 最重要",
};

function createEmptyTarget() {
  return {
    id: uuidv4(),
    name: "",
    relationship: "同僚" as Relationship,
    preferences: [] as Preference[],
    gaveLastYear: false,
    receivedReturn: false,
    memo: "",
    gender: "未回答" as Gender,
    ageGroup: "30代" as AgeGroup,
    returnValue: null as number | null,
    gaveYearBefore: false,
    receivedReturnYearBefore: false,
    emotionalPriority: 3 as EmotionalPriority,
    relationshipGoal: "現状維持" as RelationshipGoal,
    giriAwareness: "不明" as GiriAwareness,
  };
}

export default function StrategyNewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StrategyNewContent />
    </Suspense>
  );
}

function StrategyNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      totalBudget: isDemo ? 15000 : 10000,
      targets: [createEmptyTarget()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "targets",
  });

  const isAnalyzing = form.formState.isSubmitting;
  const watchTargets = form.watch("targets");
  const watchBudget = form.watch("totalBudget");
  const validCount = watchTargets.filter((t) => t.name.trim() !== "").length;

  async function loadDemoData() {
    try {
      const res = await fetch("/api/demo-data");
      const data = await res.json();
      form.setValue("totalBudget", data.budget);
      form.setValue("targets", data.targets, { shouldValidate: true });
    } catch {
      form.setError("root", { message: "デモデータの読み込みに失敗しました" });
    }
  }

  async function onSubmit(values: StrategyFormValues) {
    const validTargets = values.targets.filter((t) => t.name.trim() !== "");
    if (validTargets.length === 0) {
      form.setError("targets", { message: "名前が入力された対象者が必要です" });
      return;
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targets: validTargets,
          totalBudget: values.totalBudget,
        }),
      });

      if (!res.ok) throw new Error("分析に失敗しました");

      const data = await res.json();
      saveStrategy({
        id: data.id,
        totalBudget: values.totalBudget,
        targets: validTargets as Target[],
        analysisResult: data.analysisResult,
        createdAt: new Date().toISOString(),
      });
      router.push(`/strategy/${data.id}`);
    } catch {
      form.setError("root", {
        message: "分析中にエラーが発生しました。もう一度お試しください。",
      });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              トップに戻る
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold tracking-tight">ValenTactics</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">戦略を立てる</h1>
          <p className="mt-1 text-muted-foreground">
            対象者の詳細情報と予算を入力して、3軸スコアリングによるAI分析を実行します
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Budget & Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-6">
                  <FormField
                    control={form.control}
                    name="totalBudget"
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-[200px]">
                        <FormLabel className="text-sm font-medium">
                          総予算（円）
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            className="text-lg font-semibold"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {validCount}人で{formatCurrency(watchBudget)} → 平均
                          {validCount > 0
                            ? formatCurrency(
                                Math.round(watchBudget / validCount)
                              )
                            : "¥0"}
                          /人
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadDemoData}
                    >
                      <Database className="h-4 w-4" />
                      デモデータ投入
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => append(createEmptyTarget())}
                      disabled={fields.length >= 20}
                    >
                      <Plus className="h-4 w-4" />
                      追加
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target List */}
            <div className="space-y-4">
              {fields.map((field, idx) => (
                <TargetCard
                  key={field.id}
                  idx={idx}
                  form={form}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(idx)}
                />
              ))}
            </div>

            {/* Root / targets errors */}
            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}
            {form.formState.errors.targets?.message && (
              <Alert variant="destructive">
                <AlertDescription>
                  {form.formState.errors.targets.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isAnalyzing}
                className="min-w-[280px] h-12 text-base shadow-lg shadow-primary/25"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    AI分析を実行（{validCount}人）
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                最大20人まで登録可能 / 3軸スコアリングで分析します
              </p>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────
// 対象者カードコンポーネント
// ────────────────────────────────────────────
interface TargetCardProps {
  idx: number;
  form: ReturnType<typeof useForm<StrategyFormValues>>;
  canRemove: boolean;
  onRemove: () => void;
}

function TargetCard({ idx, form, canRemove, onRemove }: TargetCardProps) {
  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardContent className="pt-5">
        {/* Card header */}
        <div className="flex items-start justify-between mb-4">
          <Badge variant="secondary" className="text-xs font-bold">
            {idx + 1}
          </Badge>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Row 1: 基本情報 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name={`targets.${idx}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前 *</FormLabel>
                <FormControl>
                  <Input placeholder="例: 田中部長" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`targets.${idx}.relationship`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>関係性 *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`targets.${idx}.gender`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>性別</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`targets.${idx}.ageGroup`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>年代</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AGE_GROUPS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />

        {/* Row 2: 戦略設定 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name={`targets.${idx}.relationshipGoal`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>関係性の目標 *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RELATIONSHIP_GOALS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`targets.${idx}.emotionalPriority`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>感情的重要度 *</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {([1, 2, 3, 4, 5] as EmotionalPriority[]).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {EMOTIONAL_LABELS[n]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`targets.${idx}.giriAwareness`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>義理認識</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GIRI_AWARENESS_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />

        {/* Row 3: 過去実績 */}
        <p className="text-sm font-medium mb-3">過去の実績</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`targets.${idx}.gaveLastYear`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label className="cursor-pointer text-sm">去年渡した</Label>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`targets.${idx}.receivedReturn`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label className="cursor-pointer text-sm">
                    去年お返しあり
                  </Label>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name={`targets.${idx}.gaveYearBefore`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label className="cursor-pointer text-sm">
                    一昨年渡した
                  </Label>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`targets.${idx}.receivedReturnYearBefore`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label className="cursor-pointer text-sm">
                    一昨年お返しあり
                  </Label>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`targets.${idx}.returnValue`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>お返しの推定金額（円）</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    placeholder="例: 3000"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? null : Number(v));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-4" />

        {/* Row 4: 好み & メモ */}
        <FormField
          control={form.control}
          name={`targets.${idx}.preferences`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>好み・タグ</FormLabel>
              <div className="flex flex-wrap gap-2">
                {PREFERENCES.map((pref) => {
                  const selected = field.value.includes(pref);
                  return (
                    <Badge
                      key={pref}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer select-none transition-colors"
                      onClick={() => {
                        const next = selected
                          ? field.value.filter((p: string) => p !== pref)
                          : [...field.value, pref];
                        field.onChange(next);
                      }}
                    >
                      {pref}
                    </Badge>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        <div className="mt-4">
          <FormField
            control={form.control}
            name={`targets.${idx}.memo`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>メモ</FormLabel>
                <FormControl>
                  <Input
                    placeholder="自由記述（最近の関係性、注意点など）"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
