import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createPersonalSession } from "@/lib/personalSession";

// 이름 + 비밀번호로 새 계정을 만든다. (인사실 명단과 무관 — 누구나 생성 가능)
export async function POST(req: NextRequest) {
  const { name, password } = await req.json();
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  if (typeof password !== "string" || password.length < 4) {
    return NextResponse.json({ error: "비밀번호는 4자 이상이어야 해요." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const account = await prisma.publicAccount.create({
    data: { name: trimmedName, passwordHash },
  });

  await createPersonalSession(account.id);
  return NextResponse.json({ id: account.id, name: account.name, shareToken: account.shareToken });
}
