import Link from "next/link";
import {
  Heart,
  Gift,
  BarChart3,
  MessageSquareHeart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const features = [
  {
    icon: BarChart3,
    title: "優先度スコアリング",
    description: "関係性・過去の実績からS/A/B/Cランクを自動算出",
  },
  {
    icon: Gift,
    title: "ギフト最適化",
    description: "好み × 予算 × 関係性でベストなギフトを提案",
  },
  {
    icon: MessageSquareHeart,
    title: "メッセージ生成",
    description: "関係性に合ったトーンでメッセージ文面を自動作成",
  },
  {
    icon: Sparkles,
    title: "ROI予測",
    description: "ホワイトデーの回収確率と期待倍率を分析",
  },
];

const comparisonData = [
  ["金銭的リターン（ホワイトデー回収）", "受注・売上・アップセル", "ROI予測"],
  ["関係性リターン（信頼構築）", "紹介獲得・長期パートナーシップ", "リレーションシップバリュー"],
  ["感情的重要度（気持ち重視）", "戦略的アカウント（赤字でも維持）", "ポートフォリオ戦略"],
  ["損切り推奨", "ロスカット判定", "リソース最適化"],
  ["2年連続お返しなし → 撤退", "2Q連続未反応リード → ナーチャリング停止", "離脱判定ルール"],
  ["感情スコアによる予算補正", "戦略アカウントへの赤字投資許容", "定性判断の定量化"],
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-bold text-lg tracking-tight">
              ValenTactics
            </span>
          </div>
          <Button asChild>
            <Link href="/strategy/new">
              戦略を立てる
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
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
              <span className="text-primary">戦略的</span>に攻略する
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              「誰に・何を・どう渡すか」をAIが最適化。
              <br />
              対象者リストと予算を入力するだけで、ランク付け・予算配分・
              ギフト提案・メッセージ生成・ROI予測を一括分析します。
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25" asChild>
                <Link href="/strategy/new">
                  <Sparkles className="h-5 w-5" />
                  今すぐ戦略を立てる
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/strategy/new?demo=true">
                  デモデータで試す
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* Features */}
        <section className="bg-card py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold mb-2">主要機能</h2>
            <p className="text-center text-muted-foreground mb-12">
              AIがバレンタイン戦略の全工程を最適化します
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="mb-2 inline-flex rounded-xl bg-secondary p-3 w-fit">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Sales Comparison */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-2xl font-bold mb-2">
              セールス応用対比
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              バレンタイン戦略のロジックはそのままセールスに応用可能
            </p>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">
                      バレンタイン機能
                    </TableHead>
                    <TableHead className="font-semibold">
                      セールス応用
                    </TableHead>
                    <TableHead className="font-semibold">
                      共通ロジック
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map(([v, s, c]) => (
                    <TableRow key={v}>
                      <TableCell>{v}</TableCell>
                      <TableCell>{s}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
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
