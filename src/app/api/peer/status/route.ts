import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionMemberId } from "@/lib/session";

// 내가 아직 채우지 않은 동료 목록(+누구를 이미 채웠는지)을 돌려준다.
// SubmissionStatus 는 "완료 여부"만 담고 있어서, 이 응답에는 평가 내용이 전혀 노출되지 않는다.
export async function GET() {
  const memberId = await getSessionMemberId();
  if (!memberId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const [members, done] = await Promise.all([
    prisma.member.findMany({ where: { id: { not: memberId } }, orderBy: [{ team: "asc" }, { name: "asc" }] }),
    prisma.submissionStatus.findMany({ where: { evaluatorId: memberId }, select: { targetId: true } }),
  ]);
  const doneSet = new Set(done.map((d) => d.targetId));

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      team: m.team,
      role: m.role,
      done: doneSet.has(m.id),
    })),
  });
}
