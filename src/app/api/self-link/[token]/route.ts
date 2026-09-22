import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMemberLinkToken } from "@/lib/memberLink";
import { ADJECTIVE_IDS, PICK_MIN } from "@/lib/adjectives";

// 로그인 없이 링크 하나로 접근하는 자기평가 화면. 세션 대신 서명 토큰으로 본인을 특정한다.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const memberId = verifyMemberLinkToken("self", token);
  if (!memberId) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  const picks = await prisma.selfPick.findMany({ where: { memberId } });
  return NextResponse.json({ name: member.name, adjectiveIds: picks.map((p) => p.adjectiveId) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const memberId = verifyMemberLinkToken("self", token);
  if (!memberId) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  const { adjectiveIds } = await req.json();
  if (!Array.isArray(adjectiveIds) || adjectiveIds.some((id) => typeof id !== "string" || !ADJECTIVE_IDS.has(id))) {
    return NextResponse.json({ error: "잘못된 형용사 목록이에요." }, { status: 400 });
  }
  if (adjectiveIds.length < PICK_MIN) {
    return NextResponse.json({ error: `최소 ${PICK_MIN}개를 골라주세요.` }, { status: 400 });
  }

  const unique = Array.from(new Set(adjectiveIds)) as string[];
  await prisma.$transaction([
    prisma.selfPick.deleteMany({ where: { memberId } }),
    prisma.selfPick.createMany({ data: unique.map((adjectiveId) => ({ memberId, adjectiveId })) }),
  ]);

  return NextResponse.json({ ok: true, count: unique.length });
}
