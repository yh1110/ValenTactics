import Link from "next/link";
import {
  Heart,
  Gift,
  BarChart3,
  MessageSquareHeart,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: BarChart3,
    title: "3軸スコアリング",
    description: "ROI × 関係性 × 感情の加重平均でS/A/B/Cランクを自動算出",
  },
  {
    icon: Gift,
    title: "ギフト最適化",
    description: "好み × 予算 × 関係性でベストなギフトを個別提案",
  },
  {
    icon: MessageSquareHeart,
    title: "メッセージ生成",
    description: "関係性に合ったトーンでメッセージ文面を自動作成",
  },
  {
    icon: Sparkles,
    title: "成功タイプ判定",
    description: "投資型・感情型・関係構築型など6タイプに自動分類",
  },
];

const steps = [
  { num: "1", title: "基本情報", desc: "名前・関係性・性別・年代を入力" },
  { num: "2", title: "関係性・感情", desc: "目標・重要度・義理認識を設定" },
  { num: "3", title: "過去の実績", desc: "お返し履歴と推定金額を記録" },
  { num: "4", title: "好み・予算", desc: "好みタグと個人予算を設定" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-bold text-lg tracking-tight">ValenTactics</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/targets">
                <Users className="h-4 w-4" />
                一覧を見る
              </Link>
            </Button>
            <Button asChild>
              <Link href="/targets/new">
                対象者を登録
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
            <div className="absolute top-1/2 right-1/3 h-48 w-48 rounded-full bg-amber-100/40 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl px-6 text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 py-1.5">
              <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
              AI職場Hack プロジェクト
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              バレンタインを
              <br />
              <span className="text-primary">一人ずつ</span>戦略的に
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              対象者ごとにステップ形式で情報を入力し、AIが個別分析。
              <br />
              3軸スコアリングでランク判定・ギフト提案・メッセージ生成・成功タイプ分類を一括実行します。
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25" asChild>
                <Link href="/targets/new">
                  <Sparkles className="h-5 w-5" />
                  対象者を登録する
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/targets">
                  <Users className="h-5 w-5" />
                  一覧を見る
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* Steps */}
        <section className="bg-card py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold mb-2">ステップ形式で簡単登録</h2>
            <p className="text-center text-muted-foreground mb-12">
              4ステップで入力完了。最後にAIが自動分析します
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <Card key={s.num} className="text-center">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-3">
                      {s.num}
                    </div>
                    <p className="font-semibold mb-1">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold mb-2">AI分析機能</h2>
            <p className="text-center text-muted-foreground mb-12">
              一人ひとりに最適な戦略を自動生成
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Card key={f.title} className="group hover:border-primary/30 hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <div className="mb-2 inline-flex rounded-xl bg-secondary p-3 w-fit">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Separator />
      <footer className="bg-card py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>ValenTactics — AI職場Hack プロジェクト</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
