// 조직도(명단) — 실제 구성원 이름으로 반드시 교체해서 배포하세요.
// 팀 구성은 대화에서 확인된 실제 규모(R팀 3 / 인사관리팀 11 / 복지팀 6 / 보상팀 6)를 반영했습니다.
// 이름은 전부 자리표시자(placeholder)입니다 — prisma/seed.ts 가 이 배열로 DB를 시딩하니,
// 배포 전에 아래 name 값들을 실제 구성원 이름으로 바꿔주세요. id는 고유하기만 하면 됩니다.

export type OrgMember = {
  id: string;
  name: string;
  team: string | null;
  role: "실장" | "팀장" | "팀원";
};

function makeTeam(teamName: string, count: number, prefix: string): OrgMember[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${String(i + 1).padStart(2, "0")}`,
    name: `[[${teamName} 구성원 ${i + 1} — 이름 교체 필요]]`,
    team: teamName,
    role: (i === 0 ? "팀장" : "팀원") as OrgMember["role"],
  }));
}

export const DIVISION_NAME = "인사실";

export const ORG_MEMBERS: OrgMember[] = [
  { id: "head01", name: "[[실장 — 이름 교체 필요]]", team: null, role: "실장" },
  ...makeTeam("R팀", 3, "rt"),
  ...makeTeam("인사관리팀", 11, "hr"),
  ...makeTeam("복지팀", 6, "wf"),
  ...makeTeam("보상팀", 6, "cp"),
];

export const TEAM_NAMES = Array.from(new Set(ORG_MEMBERS.map((m) => m.team).filter(Boolean))) as string[];

export function findByName(name: string): OrgMember[] {
  return ORG_MEMBERS.filter((m) => m.name === name);
}

export function findById(id: string): OrgMember | undefined {
  return ORG_MEMBERS.find((m) => m.id === id);
}
