import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPersonalSessionId } from "@/lib/personalSession";
import { classify, indices } from "@/lib/johari";

// 마감 전에는 절대 조회 불가(정보 자체를 안 내려줌).
export async function GET() {
  const accountId = await getPersonalSessionId();
  if (!accountId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const account = await prisma.publicAccount.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "계정을 찾을 수 없어요." }, { status: 404 });

  const evaluatorCount = await prisma.publicSubmissionMark.count({ where: { accountId } });

  if (!account.closed) {
    return NextResponse.json({ available: false, reason: "not_closed", evaluatorCount, minEvaluators: account.minEvaluators });
  }

  const [selfPicks, counts] = await Promise.all([
    prisma.publicSelfPick.findMany({ where: { accountId } }),
    prisma.publicAdjectiveCount.findMany({ where: { accountId } }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.adjectiveId, c.count]));
  const classified = classify(
    selfPicks.map((p) => p.adjectiveId),
    countMap
  );
  const idx = indices(classified);

  return NextResponse.json({ available: true, evaluatorCount, minEvaluators: account.minEvaluators, classified, indices: idx });
}
