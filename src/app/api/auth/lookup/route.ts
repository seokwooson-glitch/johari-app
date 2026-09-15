import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DIVISION_NAME } from "@/lib/org";

// 이름으로 명단을 대조한다. 동명이인이면 여러 후보를 반환해 팀으로 구분하게 한다.
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const q = typeof name === "string" ? name.trim() : "";
  if (!q) return NextResponse.json({ candidates: [] });

  const matches = await prisma.member.findMany({
    where: { name: q },
    include: { credential: true },
  });

  return NextResponse.json({
    division: DIVISION_NAME,
    candidates: matches.map((m) => ({
      id: m.id,
      name: m.name,
      team: m.team,
      role: m.role,
      hasPassword: !!m.credential,
    })),
  });
}
