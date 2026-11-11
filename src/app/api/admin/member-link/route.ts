import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createMemberLinkToken } from "@/lib/memberLink";
import { findById } from "@/lib/org";

// 장기 휴가 복귀자처럼 진행 기간을 놓친 구성원을 위해, 로그인 없이 바로 쓸 수 있는
// 자기평가/결과 링크를 생성해주는 관리자 전용 API.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });

  const memberId = req.nextUrl.searchParams.get("memberId");
  if (!memberId) return NextResponse.json({ error: "memberId가 필요해요." }, { status: 400 });

  const member = findById(memberId);
  if (!member) return NextResponse.json({ error: "명단에 없는 구성원이에요." }, { status: 404 });

  const origin = req.nextUrl.origin;
  const selfToken = createMemberLinkToken("self", memberId);
  const resultToken = createMemberLinkToken("result", memberId);

  return NextResponse.json({
    name: member.name,
    selfUrl: `${origin}/self-link/${selfToken}`,
    resultUrl: `${origin}/result-link/${resultToken}`,
  });
}
