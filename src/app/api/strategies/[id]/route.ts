import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(
    { error: `戦略 ${id} が見つかりません。クライアント側のストレージを確認してください。` },
    { status: 404 }
  );
}
