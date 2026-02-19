import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { targetFormSchema } from "@/lib/schema";

export async function GET() {
  const targets = await prisma.target.findMany({
    include: { analysis: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(targets);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = targetFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "バリデーションエラー", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const target = await prisma.target.create({
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
  });

  return NextResponse.json(target, { status: 201 });
}
