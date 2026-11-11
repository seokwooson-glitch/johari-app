import { NextRequest, NextResponse } from "next/server";
import { verifyMemberLinkToken } from "@/lib/memberLink";
import { getMemberResult } from "@/lib/memberResult";

// 로그인 없이 링크 하나로 접근하는 결과 화면. /api/results와 동일한 규칙(마감 + 최소 응답자 수)을
// 그대로 따르되, 세션 대신 서명 토큰으로 본인을 특정한다.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const memberId = verifyMemberLinkToken("result", token);
  if (!memberId) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  const result = await getMemberResult(memberId);
  if (!result) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  return NextResponse.json(result);
}
