import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionMemberId } from "@/lib/session";

export async function GET() {
  const memberId = await getSessionMemberId();
  if (!memberId) return NextResponse.json({ member: null });

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.json({ member: null });

  return NextResponse.json({
    member: { id: member.id, name: member.name, team: member.team, role: member.role },
  });
}
