import { NextResponse } from "next/server";
import { DEMO_TARGETS, DEMO_BUDGET } from "@/lib/demo-data";

export async function GET() {
  return NextResponse.json({
    targets: DEMO_TARGETS,
    budget: DEMO_BUDGET,
  });
}
