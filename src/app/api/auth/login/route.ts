import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";

// 최초 방문: 비밀번호를 설정(set)한다. 이후 방문: 기존 비밀번호를 확인(verify)한다.
export async function POST(req: NextRequest) {
  const { id, password } = await req.json();
  if (typeof id !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 해요." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { id }, include: { credential: true } });
  if (!member) return NextResponse.json({ error: "명단에서 찾을 수 없어요." }, { status: 404 });

  if (!member.credential) {
    // 최초 설정
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.credential.create({ data: { memberId: member.id, passwordHash } });
  } else {
    const ok = await bcrypt.compare(password, member.credential.passwordHash);
    if (!ok) return NextResponse.json({ error: "비밀번호가 일치하지 않아요." }, { status: 401 });
  }

  await createSession(member.id);
  return NextResponse.json({ id: member.id, name: member.name, team: member.team, role: member.role });
}
