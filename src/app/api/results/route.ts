import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionMemberId } from "@/lib/session";
import { classify, indices } from "@/lib/johari";

// 개인 결과만 존재(팀/조직 집계 없음). 마감 + 최소 응답자 수(k-익명성) 둘 다 충족해야 공개.
export async function GET() {
  const memberId = await getSessionMemberId();
  if (!memberId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const config = await prisma.config.findUnique({ where: { id: 1 } });
  const closed = config?.closed ?? false;
  const minEvaluators = config?.minEvaluators ?? 3;

  const evaluatorCount = await prisma.submissionStatus.count({ where: { targetId: memberId } });

  if (!closed) {
    return NextResponse.json({ available: false, reason: "period_open", evaluatorCount, minEvaluators });
  }
  if (evaluatorCount < minEvaluators) {
    return NextResponse.json({ available: false, reason: "not_enough_evaluators", evaluatorCount, minEvaluators });
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
    available: true,
    evaluatorCount,
    minEvaluators,
    classified,
    indices: idx,
  });
}
