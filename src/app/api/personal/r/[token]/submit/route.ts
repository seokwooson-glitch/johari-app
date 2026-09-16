import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ADJECTIVE_IDS, PICK_MIN } from "@/lib/adjectives";

// 익명성 핵심: 평가자는 계정이 없다. evaluatorToken은 평가자 브라우저가 만든 무작위
// 값(개인 식별 정보 아님)으로, 오직 "같은 브라우저가 두 번 제출하는 것"만 막는 용도다.
// 형용사 카운트(PublicAdjectiveCount)에는 이 토큰이 전혀 들어가지 않는다.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { password, adjectiveIds, evaluatorToken } = await req.json();

  const account = await prisma.publicAccount.findUnique({ where: { shareToken: token } });
  if (!account) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });
  if (account.closed) return NextResponse.json({ error: "이미 마감된 링크라 더 이상 제출할 수 없어요." }, { status: 409 });

  if (account.sharePasswordHash) {
    if (typeof password !== "string" || !(await bcrypt.compare(password, account.sharePasswordHash))) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않아요." }, { status: 401 });
    }
  }

  if (typeof evaluatorToken !== "string" || evaluatorToken.length < 8) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  if (!Array.isArray(adjectiveIds) || adjectiveIds.some((id) => typeof id !== "string" || !ADJECTIVE_IDS.has(id))) {
    return NextResponse.json({ error: "잘못된 형용사 목록이에요." }, { status: 400 });
  }
  if (adjectiveIds.length < PICK_MIN) {
    return NextResponse.json({ error: `최소 ${PICK_MIN}개를 골라주세요.` }, { status: 400 });
  }

  const already = await prisma.publicSubmissionMark.findUnique({
    where: { accountId_evaluatorToken: { accountId: account.id, evaluatorToken } },
  });
  if (already) {
    return NextResponse.json({ error: "이미 이 브라우저로 제출했어요." }, { status: 409 });
  }

  const unique = Array.from(new Set(adjectiveIds)) as string[];

  await prisma.$transaction([
    ...unique.map((adjectiveId) =>
      prisma.publicAdjectiveCount.upsert({
        where: { accountId_adjectiveId: { accountId: account.id, adjectiveId } },
        update: { count: { increment: 1 } },
        create: { accountId: account.id, adjectiveId, count: 1 },
      })
    ),
    prisma.publicSubmissionMark.create({ data: { accountId: account.id, evaluatorToken } }),
  ]);

  return NextResponse.json({ ok: true });
}
