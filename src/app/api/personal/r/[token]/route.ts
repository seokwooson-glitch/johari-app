import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 평가 링크 기본 정보 — 비밀번호 없이도 "누구를 평가하는 링크인지 / 이미 마감됐는지"는 보여준다.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const account = await prisma.publicAccount.findUnique({ where: { shareToken: token } });
  if (!account) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });

  return NextResponse.json({
    ownerName: account.name,
    closed: account.closed,
    requiresPassword: !!account.sharePasswordHash,
  });
}
