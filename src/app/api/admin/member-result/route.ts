import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getMemberResult } from "@/lib/memberResult";

// 관리자가 구성원 이름으로 찾아 그 사람의 결과를 직접 조회. 공개 조건(마감 + 최소 응답자 수)은 동일하게 적용.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });

  const memberId = req.nextUrl.searchParams.get("memberId");
  if (!memberId) return NextResponse.json({ error: "memberId가 필요해요." }, { status: 400 });

  const result = await getMemberResult(memberId);
  if (!result) return NextResponse.json({ error: "명단에 없는 구성원이에요." }, { status: 404 });

  return NextResponse.json(result);
}
