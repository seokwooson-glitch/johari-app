import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionMemberId } from "@/lib/session";
import { ADJECTIVE_IDS, PICK_MIN } from "@/lib/adjectives";

// 익명성의 핵심 지점: 이 트랜잭션은 (1) 대상자의 형용사별 카운트만 올리고,
// (2) "제출했다"는 사실만(내용 없이) 기록한다. 두 기록 다 evaluatorId 와 실제 선택을
// 같은 곳에 두지 않으므로, 나중에 "누가 이 형용사를 골랐는지"를 복원할 방법이 없다.
// 한 번 제출하면 재제출/수정을 막아(불변) 익명성이 추후에도 깨지지 않게 한다.
export async function POST(req: NextRequest) {
  const evaluatorId = await getSessionMemberId();
  if (!evaluatorId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const { targetId, adjectiveIds } = await req.json();
  if (typeof targetId !== "string") {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  if (targetId === evaluatorId) {
    return NextResponse.json({ error: "본인은 '나를 고르기'에서 입력해주세요." }, { status: 400 });
  }
  if (!Array.isArray(adjectiveIds) || adjectiveIds.some((id) => typeof id !== "string" || !ADJECTIVE_IDS.has(id))) {
    return NextResponse.json({ error: "잘못된 형용사 목록이에요." }, { status: 400 });
  }
  if (adjectiveIds.length < PICK_MIN) {
    return NextResponse.json({ error: `최소 ${PICK_MIN}개를 골라주세요.` }, { status: 400 });
  }

  const target = await prisma.member.findUnique({ where: { id: targetId } });
  if (!target) return NextResponse.json({ error: "대상을 찾을 수 없어요." }, { status: 404 });

  const already = await prisma.submissionStatus.findUnique({
    where: { evaluatorId_targetId: { evaluatorId, targetId } },
  });
  if (already) {
    return NextResponse.json({ error: "이미 채운 동료예요. 익명성 보호를 위해 재제출은 막혀 있어요." }, { status: 409 });
  }

  const unique = Array.from(new Set(adjectiveIds)) as string[];

  await prisma.$transaction([
    // 평가자 식별자 없이 대상자 카운트만 +1
    ...unique.map((adjectiveId) =>
      prisma.adjectiveCount.upsert({
        where: { targetId_adjectiveId: { targetId, adjectiveId } },
        update: { count: { increment: 1 } },
        create: { targetId, adjectiveId, count: 1 },
      })
    ),
    // 제출 여부만(중복 방지용) 기록 — 내용 없음
    prisma.submissionStatus.create({ data: { evaluatorId, targetId } }),
  ]);

  return NextResponse.json({ ok: true });
}
