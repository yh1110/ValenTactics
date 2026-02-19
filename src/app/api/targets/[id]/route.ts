import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { targetFormSchema } from "@/lib/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const target = await prisma.target.findUnique({
    where: { id },
    include: { analysis: true },
  });

  if (!target) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }
  return NextResponse.json(target);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = targetFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "バリデーションエラー", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // 既存の分析結果を削除（再分析のため）
  await prisma.analysisResult.deleteMany({ where: { targetId: id } });

  const target = await prisma.target.update({
    where: { id },
    data: {
      name: data.name,
      gender: data.gender,
      ageGroup: data.ageGroup,
      relationship: data.relationship,
      benefitType: data.benefitType,
      personality: data.personality,
      preferences: data.preferences,
      recentInterests: data.recentInterests,
      giftReaction: data.giftReaction,
      relationshipGoal: data.relationshipGoal,
      emotionalPriority: data.emotionalPriority,
      giriAwareness: data.giriAwareness,
      returnTendency: data.returnTendency,
      gaveLastYear: data.gaveLastYear,
      receivedReturn: data.receivedReturn,
      returnValue: data.returnValue,
      gaveYearBefore: data.gaveYearBefore,
      receivedReturnYearBefore: data.receivedReturnYearBefore,
      memo: data.memo,
      budget: data.budget,
    },
    include: { analysis: true },
  });

  return NextResponse.json(target);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.target.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
