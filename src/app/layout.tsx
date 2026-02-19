import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ValenTactics — バレンタイン最適化戦略ダッシュボード",
  description:
    "誰に・何を・どう渡すか、AIが最適化するバレンタイン戦略ダッシュボード",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
