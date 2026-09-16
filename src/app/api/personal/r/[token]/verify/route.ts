import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// 링크 비밀번호만 확인(로그인은 아님 — 평가자는 계정이 없음).
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { password } = await req.json();

  const account = await prisma.publicAccount.findUnique({ where: { shareToken: token } });
  if (!account) return NextResponse.json({ error: "링크를 찾을 수 없어요." }, { status: 404 });
  if (account.closed) return NextResponse.json({ error: "이미 마감된 링크예요." }, { status: 409 });

  if (account.sharePasswordHash) {
    if (typeof password !== "string" || !(await bcrypt.compare(password, account.sharePasswordHash))) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않아요." }, { status: 401 });
    }
  }

  return NextResponse.json({ ok: true, ownerName: account.name });
}
