import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { analyzeTargets } from "@/lib/mock-analysis";
import type { Target } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targets, totalBudget } = body as {
      targets: Target[];
      totalBudget: number;
    };

    if (!targets || targets.length === 0) {
      return NextResponse.json(
        { error: "対象者が指定されていません" },
        { status: 400 }
      );
    }

    if (targets.length > 20) {
      return NextResponse.json(
        { error: "対象者は最大20人までです" },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const analysisResult = analyzeTargets(targets, totalBudget);
    const id = uuidv4();

    return NextResponse.json({ id, analysisResult });
  } catch {
    return NextResponse.json(
      { error: "分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
