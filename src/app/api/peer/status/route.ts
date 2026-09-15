import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionMemberId } from "@/lib/session";

// 팀 안에서의 노출 순서: 팀장 -> 파트장 -> 부팀장 -> 팀원(가나다순).
// 같은 직책끼리는 가나다순으로, 팀원도 가나다순으로 정렬한다.
const ROLE_RANK: Record<string, number> = { 실장: 0, 팀장: 1, 파트장: 2, 부팀장: 3, 팀원: 4 };

function compareMembers(a: { role: string | null; name: string }, b: { role: string | null; name: string }) {
  const ra = ROLE_RANK[a.role ?? "팀원"] ?? 99;
  const rb = ROLE_RANK[b.role ?? "팀원"] ?? 99;
  if (ra !== rb) return ra - rb;
  return a.name.localeCompare(b.name, "ko");
}

// 내가 아직 채우지 않은 동료 목록(+누구를 이미 채웠는지)을 돌려준다.
// SubmissionStatus 는 "완료 여부"만 담고 있어서, 이 응답에는 평가 내용이 전혀 노출되지 않는다.
export async function GET() {
  const memberId = await getSessionMemberId();
  if (!memberId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const [members, done] = await Promise.all([
    prisma.member.findMany({ where: { id: { not: memberId } } }),
    prisma.submissionStatus.findMany({ where: { evaluatorId: memberId }, select: { targetId: true } }),
  ]);
  const doneSet = new Set(done.map((d) => d.targetId));

  return NextResponse.json({
    members: members
      .map((m) => ({
        id: m.id,
        name: m.name,
        team: m.team,
        role: m.role,
        done: doneSet.has(m.id),
      }))
      .sort(compareMembers),
  });
}
