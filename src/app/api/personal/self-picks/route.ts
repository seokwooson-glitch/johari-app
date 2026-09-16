import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPersonalSessionId } from "@/lib/personalSession";
import { ADJECTIVE_IDS, PICK_MIN } from "@/lib/adjectives";

export async function GET() {
  const accountId = await getPersonalSessionId();
  if (!accountId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const picks = await prisma.publicSelfPick.findMany({ where: { accountId } });
  return NextResponse.json({ adjectiveIds: picks.map((p) => p.adjectiveId) });
}

export async function POST(req: NextRequest) {
  const accountId = await getPersonalSessionId();
  if (!accountId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const { adjectiveIds } = await req.json();
  if (!Array.isArray(adjectiveIds) || adjectiveIds.some((id) => typeof id !== "string" || !ADJECTIVE_IDS.has(id))) {
    return NextResponse.json({ error: "잘못된 형용사 목록이에요." }, { status: 400 });
  }
  if (adjectiveIds.length < PICK_MIN) {
    return NextResponse.json({ error: `최소 ${PICK_MIN}개를 골라주세요.` }, { status: 400 });
  }

  const unique = Array.from(new Set(adjectiveIds));
  await prisma.$transaction([
    prisma.publicSelfPick.deleteMany({ where: { accountId } }),
    prisma.publicSelfPick.createMany({ data: unique.map((adjectiveId) => ({ accountId, adjectiveId })) }),
  ]);

  return NextResponse.json({ ok: true, count: unique.length });
}
