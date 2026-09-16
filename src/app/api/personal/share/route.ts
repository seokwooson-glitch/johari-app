import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getPersonalSessionId } from "@/lib/personalSession";

export async function GET() {
  const accountId = await getPersonalSessionId();
  if (!accountId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const account = await prisma.publicAccount.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "계정을 찾을 수 없어요." }, { status: 404 });

  const evaluatorCount = await prisma.publicSubmissionMark.count({ where: { accountId } });

  return NextResponse.json({
    shareToken: account.shareToken,
    hasSharePassword: !!account.sharePasswordHash,
    closed: account.closed,
    minEvaluators: account.minEvaluators,
    evaluatorCount,
    canClose: evaluatorCount >= account.minEvaluators,
  });
}

// 평가 링크 비밀번호 설정/변경
export async function POST(req: NextRequest) {
  const accountId = await getPersonalSessionId();
  if (!accountId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const { password } = await req.json();
  if (typeof password !== "string" || password.length < 4) {
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 해요." }, { status: 400 });
  }

  const sharePasswordHash = await bcrypt.hash(password, 10);
  await prisma.publicAccount.update({ where: { id: accountId }, data: { sharePasswordHash } });

  return NextResponse.json({ ok: true });
}
