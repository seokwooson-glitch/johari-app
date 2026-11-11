import { prisma } from "@/lib/db";
import { classify, indices, type Classified } from "@/lib/johari";

export type MemberResult = {
  name: string;
  available: boolean;
  reason?: "period_open" | "not_enough_evaluators";
  evaluatorCount: number;
  minEvaluators: number;
  classified?: Classified;
  indices?: ReturnType<typeof indices>;
};

// 개인 결과만 존재(팀/조직 집계 없음). 마감 + 최소 응답자 수(k-익명성) 둘 다 충족해야 공개.
export async function getMemberResult(memberId: string): Promise<MemberResult | null> {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return null;

  const config = await prisma.config.findUnique({ where: { id: 1 } });
  const closed = config?.closed ?? false;
  const minEvaluators = config?.minEvaluators ?? 3;

  const evaluatorCount = await prisma.submissionStatus.count({ where: { targetId: memberId } });

  if (!closed) {
    return { name: member.name, available: false, reason: "period_open", evaluatorCount, minEvaluators };
  }
  if (evaluatorCount < minEvaluators) {
    return { name: member.name, available: false, reason: "not_enough_evaluators", evaluatorCount, minEvaluators };
  }

  const [selfPicks, counts] = await Promise.all([
    prisma.selfPick.findMany({ where: { memberId } }),
    prisma.adjectiveCount.findMany({ where: { targetId: memberId } }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.adjectiveId, c.count]));
  const classified = classify(
    selfPicks.map((p) => p.adjectiveId),
    countMap
  );

  return {
    name: member.name,
    available: true,
    evaluatorCount,
    minEvaluators,
    classified,
    indices: indices(classified),
  };
}
