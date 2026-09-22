import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMemberLinkToken } from "@/lib/memberLink";
import { classify, indices } from "@/lib/johari";

// 로그인 없이 링크 하나로 접근하는 결과 화면. /api/results와 동일한 규칙(마감 + 최소 응답자 수)을
// 그대로 따르되, 세션 대신 서명 토큰으로 본인을 특정한다.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const memberId = verifyMemberLinkToken("result", token);
  if (!memberId) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  const config = await prisma.config.findUnique({ where: { id: 1 } });
  const closed = config?.closed ?? false;
  const minEvaluators = config?.minEvaluators ?? 3;

  const evaluatorCount = await prisma.submissionStatus.count({ where: { targetId: memberId } });

  if (!closed) {
    return NextResponse.json({ name: member.name, available: false, reason: "period_open", evaluatorCount, minEvaluators });
  }
  if (evaluatorCount < minEvaluators) {
    return NextResponse.json({
      name: member.name,
      available: false,
      reason: "not_enough_evaluators",
      evaluatorCount,
      minEvaluators,
    });
  }

  const [selfPicks, counts] = await Promise.all([
    prisma.selfPick.findMany({ where: { memberId } }),
    prisma.adjectiveCount.findMany({ where: { targetId: memberId } }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.adjectiveId, c.count]));
  const classified = classify(
    selfPicks.map((p) => p.adjectiveId),
    countMap
  );
  const idx = indices(classified);

  return NextResponse.json({
    name: member.name,
    available: true,
    evaluatorCount,
    minEvaluators,
    classified,
    indices: idx,
  });
}
