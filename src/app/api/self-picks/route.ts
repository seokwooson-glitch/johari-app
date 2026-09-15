import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionMemberId } from "@/lib/session";
import { ADJECTIVE_IDS, PICK_MIN } from "@/lib/adjectives";

export async function GET() {
  const memberId = await getSessionMemberId();
  if (!memberId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const picks = await prisma.selfPick.findMany({ where: { memberId } });
  return NextResponse.json({ adjectiveIds: picks.map((p) => p.adjectiveId) });
}

// 본인이 스스로에 대해 고른 형용사는 익명 이슈가 없으므로 자유롭게 다시 제출(덮어쓰기) 가능.
export async function POST(req: NextRequest) {
  const memberId = await getSessionMemberId();
  if (!memberId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const { adjectiveIds } = await req.json();
  if (!Array.isArray(adjectiveIds) || adjectiveIds.some((id) => typeof id !== "string" || !ADJECTIVE_IDS.has(id))) {
    return NextResponse.json({ error: "잘못된 형용사 목록이에요." }, { status: 400 });
  }
  if (adjectiveIds.length < PICK_MIN) {
    return NextResponse.json({ error: `최소 ${PICK_MIN}개를 골라주세요.` }, { status: 400 });
  }

  const unique = Array.from(new Set(adjectiveIds));
  await prisma.$transaction([
    prisma.selfPick.deleteMany({ where: { memberId } }),
    prisma.selfPick.createMany({ data: unique.map((adjectiveId) => ({ memberId, adjectiveId })) }),
  ]);

  return NextResponse.json({ ok: true, count: unique.length });
}
