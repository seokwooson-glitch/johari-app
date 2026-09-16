import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPersonalSessionId } from "@/lib/personalSession";

// 본인이 마감을 누른다. 최소 응답자 수를 넘지 못했으면 거부한다(서버에서 강제).
// 마감 후에는 새 평가 제출이 막히고(=/api/personal/r/[token]/submit), 결과 열람이 가능해진다.
export async function POST() {
  const accountId = await getPersonalSessionId();
  if (!accountId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const account = await prisma.publicAccount.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "계정을 찾을 수 없어요." }, { status: 404 });
  if (account.closed) return NextResponse.json({ ok: true, alreadyClosed: true });

  const evaluatorCount = await prisma.publicSubmissionMark.count({ where: { accountId } });
  if (evaluatorCount < account.minEvaluators) {
    return NextResponse.json(
      { error: `아직 마감할 수 없어요. 평가자가 ${account.minEvaluators}명 이상 모여야 해요. (현재 ${evaluatorCount}명)` },
      { status: 400 }
    );
  }

  await prisma.publicAccount.update({ where: { id: accountId }, data: { closed: true } });
  return NextResponse.json({ ok: true });
}
