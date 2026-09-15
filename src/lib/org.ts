// 조직도(명단) — 실제 구성원 명단 반영 (2026-09 기준)

export type Role = "실장" | "팀장" | "파트장" | "부팀장" | "팀원";

export type OrgMember = {
  id: string;
  name: string;
  team: string | null; // 실장은 null(인사실 소속, 특정 팀 없음)
  role: Role;
};

export const DIVISION_NAME = "인사실";

export const ORG_MEMBERS: OrgMember[] = [
  { id: "m01", name: "손석우", team: null, role: "실장" },

  { id: "m02", name: "최성국", team: "R팀", role: "팀장" },
  { id: "m03", name: "이지훈3", team: "R팀", role: "팀원" },
  { id: "m04", name: "곽재훈", team: "R팀", role: "팀원" },

  { id: "m05", name: "정민철2", team: "인사관리팀", role: "팀장" },
  { id: "m06", name: "백우형", team: "인사관리팀", role: "파트장" },
  { id: "m07", name: "이연진", team: "인사관리팀", role: "팀원" },
  { id: "m08", name: "곽경훈", team: "인사관리팀", role: "팀원" },
  { id: "m09", name: "서예림", team: "인사관리팀", role: "팀원" },
  { id: "m10", name: "임일영", team: "인사관리팀", role: "팀원" },
  { id: "m11", name: "강지민", team: "인사관리팀", role: "팀원" },
  { id: "m12", name: "김혜원3", team: "인사관리팀", role: "팀원" },
  { id: "m13", name: "이나혜", team: "인사관리팀", role: "파트장" },
  { id: "m14", name: "이도윤", team: "인사관리팀", role: "팀원" },
  { id: "m15", name: "이민지5", team: "인사관리팀", role: "팀원" },

  { id: "m16", name: "김정아4", team: "보상팀", role: "팀장" },
  { id: "m17", name: "이규진", team: "보상팀", role: "팀원" },
  { id: "m18", name: "김혜지", team: "보상팀", role: "팀원" },
  { id: "m19", name: "김송이", team: "보상팀", role: "팀원" },
  { id: "m20", name: "박재영3", team: "보상팀", role: "팀원" },
  { id: "m21", name: "김주영5", team: "보상팀", role: "팀원" },

  { id: "m22", name: "김혜리2", team: "복지팀", role: "부팀장" },
  { id: "m23", name: "서혜인", team: "복지팀", role: "팀원" },
  { id: "m24", name: "이다민", team: "복지팀", role: "팀원" },
  { id: "m25", name: "문예준", team: "복지팀", role: "팀원" },
  { id: "m26", name: "이자연", team: "복지팀", role: "팀장" },
];

// 화면에 팀을 나눠 보여줄 때 쓰는 순서(명단에 처음 등장하는 순서 그대로)
export const TEAM_NAMES = Array.from(
  new Set(ORG_MEMBERS.map((m) => m.team).filter((t): t is string => !!t))
);

export function findByName(name: string): OrgMember[] {
  return ORG_MEMBERS.filter((m) => m.name === name);
}

export function findById(id: string): OrgMember | undefined {
  return ORG_MEMBERS.find((m) => m.id === id);
}
