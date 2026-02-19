"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Save,
  User,
  Search,
  Handshake,
  Wallet,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

import type { BenefitType, EmotionalPriority } from "@/lib/types";
import {
  RELATIONSHIPS,
  GENDERS,
  AGE_GROUPS,
  BENEFIT_TYPES,
  RELATIONSHIP_GOALS,
  GIRI_AWARENESS_OPTIONS,
  PERSONALITIES,
  PREFERENCE_CATEGORIES,
  RETURN_TENDENCIES,
  GIFT_REACTIONS,
  RECIPIENT_ACTION_CATEGORIES,
} from "@/lib/types";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  targetFormSchema,
  type TargetFormValues,
} from "@/schema";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "基本情報", icon: User, schema: step1Schema },
  { label: "相手を知る", icon: Search, schema: step2Schema },
  { label: "関係性&実績", icon: Handshake, schema: step3Schema },
  { label: "予算", icon: Wallet, schema: step4Schema },
] as const;

const EMOTIONAL_LABELS: Record<EmotionalPriority, string> = {
  1: "1: 完全義理",
  2: "2: 義理寄り",
  3: "3: バランス",
  4: "4: かなり大事",
  5: "5: 最重要",
};

interface TargetFormProps {
  defaultValues: TargetFormValues;
  onSubmit: (values: TargetFormValues) => Promise<void>;
  mode: "create" | "edit";
}

export function TargetForm({ defaultValues, onSubmit, mode }: TargetFormProps) {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<TargetFormValues>({
    resolver: zodResolver(targetFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchBenefitType = form.watch("benefitType") as BenefitType;

  async function validateAndNext() {
    const fields = Object.keys(STEPS[step].schema.shape) as (keyof TargetFormValues)[];
    const valid = await form.trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleSubmit(values: TargetFormValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch {
      setServerError(
        mode === "create"
          ? "保存・分析中にエラーが発生しました。もう一度お試しください。"
          : "更新中にエラーが発生しました。もう一度お試しください。"
      );
    }
  }

  return (
    <>
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => { if (isDone) setStep(idx); }}
              className={cn(
                "flex flex-col items-center gap-1.5 flex-1 group",
                isDone && "cursor-pointer",
                !isDone && !isActive && "cursor-default"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isDone && "border-primary bg-primary/10 text-primary",
                  !isActive && !isDone && "border-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary",
                  isDone && "text-primary/70",
                  !isActive && !isDone && "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {/* ═══ Step 1: 基本情報 & 目的 ═══ */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>基本情報 & 目的</CardTitle>
                <CardDescription>対象者と、何を最大化するかを選択してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="benefitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>何を最大化する？ *</FormLabel>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {BENEFIT_TYPES.map((bt) => (
                          <button
                            key={bt.value}
                            type="button"
                            onClick={() => field.onChange(bt.value)}
                            className={cn(
                              "flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all",
                              field.value === bt.value
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-muted hover:border-muted-foreground/30"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{bt.emoji}</span>
                              <span className="font-semibold text-sm">{bt.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground leading-relaxed">
                              {bt.description}
                            </span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="name"
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
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>関係性 *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {RELATIONSHIPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>性別</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年代</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {AGE_GROUPS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ Step 2: 相手を知る ═══ */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>相手を知る</CardTitle>
                <CardDescription>
                  相手の情報が多いほど、ギフト提案・スコアの精度が上がります
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 性格タグ */}
                <FormField control={form.control} name="personality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>この人の性格は？（複数選択可）</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {PERSONALITIES.map((p) => {
                        const selected = field.value.includes(p);
                        return (
                          <Badge
                            key={p}
                            variant={selected ? "default" : "outline"}
                            className="cursor-pointer select-none transition-colors"
                            onClick={() => {
                              const next = selected
                                ? field.value.filter((v: string) => v !== p)
                                : [...field.value, p];
                              field.onChange(next);
                            }}
                          >
                            {p}
                          </Badge>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <Separator />

                {/* カテゴリ付き好みタグ */}
                <FormField control={form.control} name="preferences" render={({ field }) => (
                  <FormItem>
                    <FormLabel>この人の好み・傾向（複数選択可）</FormLabel>
                    <div className="space-y-4">
                      {PREFERENCE_CATEGORIES.map((cat) => (
                        <div key={cat.label}>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">{cat.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {cat.items.map((pref) => {
                              const selected = field.value.includes(pref);
                              return (
                                <Badge
                                  key={pref}
                                  variant={selected ? "default" : "outline"}
                                  className="cursor-pointer select-none transition-colors"
                                  onClick={() => {
                                    const next = selected
                                      ? field.value.filter((v: string) => v !== pref)
                                      : [...field.value, pref];
                                    field.onChange(next);
                                  }}
                                >
                                  {pref}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <Separator />

                {/* 最近の関心事 */}
                <FormField control={form.control} name="recentInterests" render={({ field }) => (
                  <FormItem>
                    <FormLabel>最近の関心事</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="最近ハマっていること、欲しがっていたもの、話題にしていたこと"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* ギフト受け取り反応 */}
                <FormField control={form.control} name="giftReaction" render={({ field }) => (
                  <FormItem>
                    <FormLabel>プレゼントをもらったときの反応</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {GIFT_REACTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          )}

          {/* ═══ Step 3: 関係性 & 過去データ ═══ */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>関係性 & 過去データ</CardTitle>
                <CardDescription>
                  {watchBenefitType === "有形"
                    ? "ROIスコアに直結します。相手のお返し傾向・過去データをできるだけ正確に"
                    : "親密度の判定に影響します。過去のやりとりも参考にします"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* 相手の行動チェックリスト */}
                <FormField control={form.control} name="recipientActions" render={({ field }) => (
                  <FormItem>
                    <FormLabel>相手の行動（当てはまるものを選択）</FormLabel>
                    <p className="text-xs text-muted-foreground mb-2">
                      相手があなたに対してとっている行動を選ぶと、客観的な親密度が測れます
                    </p>
                    <div className="space-y-4">
                      {RECIPIENT_ACTION_CATEGORIES.map((cat) => (
                        <div key={cat.label}>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">{cat.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {cat.items.map((action) => {
                              const selected = field.value.includes(action);
                              return (
                                <Badge
                                  key={action}
                                  variant={selected ? "default" : "outline"}
                                  className="cursor-pointer select-none transition-colors"
                                  onClick={() => {
                                    const next = selected
                                      ? field.value.filter((v: string) => v !== action)
                                      : [...field.value, action];
                                    field.onChange(next);
                                  }}
                                >
                                  {action}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* エピソード記述欄 */}
                <FormField control={form.control} name="recentEpisodes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>最近のエピソード</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="例: 先週相談に乗ってもらった、去年の誕生日にメッセージをくれた、2人で飲みに行った"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      チェックリストに収まらない具体的なエピソードがあれば記入してください
                    </p>
                    <FormMessage />
                  </FormItem>
                )} />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="relationshipGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>関係性の目標 *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {RELATIONSHIP_GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emotionalPriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>感情的重要度 *</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {([1, 2, 3, 4, 5] as EmotionalPriority[]).map((n) => (
                              <SelectItem key={n} value={String(n)}>{EMOTIONAL_LABELS[n]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="giriAwareness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>義理認識</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {GIRI_AWARENESS_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="returnTendency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>相手のお返し傾向</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {RETURN_TENDENCIES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="bg-muted/50 border-0 shadow-none">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-semibold">去年の実績</p>
                      <FormField control={form.control} name="gaveLastYear" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <Label className="cursor-pointer text-sm">渡した</Label>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="receivedReturn" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <Label className="cursor-pointer text-sm">お返しあり</Label>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50 border-0 shadow-none">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-semibold">一昨年の実績</p>
                      <FormField control={form.control} name="gaveYearBefore" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <Label className="cursor-pointer text-sm">渡した</Label>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="receivedReturnYearBefore" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <Label className="cursor-pointer text-sm">お返しあり</Label>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </div>

                <FormField control={form.control} name="returnValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>お返しの推定金額（円）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        placeholder="例: 3000"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          )}

          {/* ═══ Step 4: 予算 & メモ ═══ */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>予算 & メモ</CardTitle>
                <CardDescription>
                  この人に使う予算と、補足情報を入力してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>この人への予算（円）*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={100}
                        step={100}
                        className="text-lg font-semibold"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="memo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>メモ</FormLabel>
                    <FormControl>
                      <Input placeholder="自由記述（上のステップで拾えなかった情報があればここに）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          )}

          {serverError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>

            {step < STEPS.length - 1 ? (
              <Button key="next" type="button" onClick={validateAndNext}>
                次へ
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button key="submit" type="submit" disabled={isSubmitting} className="shadow-lg shadow-primary/25">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "create" ? "分析中..." : "保存・再分析中..."}
                  </>
                ) : mode === "create" ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    登録してAI分析
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    保存して再分析
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}
