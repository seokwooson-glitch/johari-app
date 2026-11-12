import { classify, indices } from "@/lib/johari";
import type { MemberResult } from "@/lib/memberResult";

// 체험용 샘플. DB를 쓰지 않으며, 동료 응답은 아래 가상의 값이다.
export const DEMO_PICKS_KEY = "johari-demo-picks";
export const DEMO_EVALUATORS = 5;

export const DEMO_DEFAULT_SELF = ["warm", "trustworthy", "logical", "reflective", "shy"];

// 형용사 id → 그 형용사를 고른 (가상) 동료 수
const DEMO_PEER_COUNTS: Record<string, number> = {
  warm: 5,
  caring: 4,
  trustworthy: 3,
  calm: 3,
  logical: 2,
  observant: 2,
  helpful: 2,
  patient: 1,
  wise: 1,
  organized: 1,
  modest: 1,
};

export function buildDemoResult(selfIds: string[]): MemberResult {
  const classified = classify(selfIds, DEMO_PEER_COUNTS);
  return {
    name: "김하리",
    available: true,
    evaluatorCount: DEMO_EVALUATORS,
    minEvaluators: 3,
    classified,
    indices: indices(classified),
  };
}
