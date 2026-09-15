import { ADJECTIVES } from "./adjectives";

export const QUAD = {
  open: {
    label: "열린 창",
    en: "Open",
    color: "#B5842A",
    bg: "rgba(201,152,52,0.13)",
    meaning: "나도 알고 동료도 아는 나. 소통이 열려 있는 영역이에요.",
  },
  blind: {
    label: "보이지 않는 창",
    en: "Blind",
    color: "#2E8A8E",
    bg: "rgba(72,160,164,0.13)",
    meaning: "나는 몰랐지만 동료들이 본 나. 좋다·나쁘다가 아니라 새로 돌아볼 재료예요.",
  },
  hidden: {
    label: "숨겨진 창",
    en: "Hidden",
    color: "#7A5AA6",
    bg: "rgba(138,106,196,0.13)",
    meaning: "나는 알지만 아직 동료에게 안 보인 나.",
  },
  unknown: {
    label: "미지의 창",
    en: "Unknown",
    color: "#7B828C",
    bg: "rgba(150,156,164,0.10)",
    meaning: "나도 동료도 아직 모르는 나.",
  },
} as const;

export type ClassifiedItem = { id: string; en: string; ko: string; cnt: number };
export type Classified = {
  open: ClassifiedItem[];
  blind: ClassifiedItem[];
  hidden: ClassifiedItem[];
  unknownCount: number;
};

/**
 * selfPicks(본인이 고른 형용사 id 목록)와 counts(형용사id -> 동료 응답 수)를 받아
 * 조하리의 4분면으로 분류한다.
 *
 * counts 는 AdjectiveCount 테이블에서 옴 — 이 값 자체가 "그 형용사를 고른 서로 다른 평가자 수"이므로
 * (한 평가자는 제출을 한 번만 하고 이후 수정 불가), 별도의 기여자 수 계산 없이 그대로 신뢰할 수 있다.
 */
export function classify(selfPicks: string[], counts: Record<string, number>): Classified {
  const open: ClassifiedItem[] = [];
  const blind: ClassifiedItem[] = [];
  const hidden: ClassifiedItem[] = [];
  let unknownCount = 0;
  const selfSet = new Set(selfPicks);

  for (const a of ADJECTIVES) {
    const self = selfSet.has(a.id);
    const cnt = counts[a.id] || 0;
    if (self && cnt > 0) open.push({ ...a, cnt });
    else if (!self && cnt > 0) blind.push({ ...a, cnt });
    else if (self && cnt === 0) hidden.push({ ...a, cnt });
    else unknownCount++;
  }
  open.sort((x, y) => y.cnt - x.cnt);
  blind.sort((x, y) => y.cnt - x.cnt);
  return { open, blind, hidden, unknownCount };
}

export function indices(c: Classified) {
  const o = c.open.length;
  const b = c.blind.length;
  const h = c.hidden.length;
  const openness = o + h > 0 ? Math.round((o / (o + h)) * 100) : null;
  const consistency = o + b > 0 ? Math.round((o / (o + b)) * 100) : null;
  return { openness, consistency, o, b, h };
}
