import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createPersonalSession } from "@/lib/personalSession";

// 이름이 고유하지 않으므로(명단이 없음), 같은 이름의 계정들을 모두 찾아 비밀번호가
// 맞는 걸 찾는다. bcrypt 해시라 계정 수가 많지 않은 한 비용은 무시할 만하다.
export async function POST(req: NextRequest) {
  const { name, password } = await req.json();
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName || typeof password !== "string") {
    return NextResponse.json({ error: "이름과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const candidates = await prisma.publicAccount.findMany({ where: { name: trimmedName } });
  for (const account of candidates) {
    if (await bcrypt.compare(password, account.passwordHash)) {
      await createPersonalSession(account.id);
      return NextResponse.json({ id: account.id, name: account.name, shareToken: account.shareToken });
    }
  }
  return NextResponse.json({ error: "이름 또는 비밀번호가 일치하지 않아요." }, { status: 401 });
}
