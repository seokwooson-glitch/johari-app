"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DIVISION_NAME, TEAM_NAMES } from "@/lib/org";

type PeerMember = { id: string; name: string; team: string | null; role: string; done: boolean };

function PersonRow({ m, onPick }: { m: PeerMember; onPick: (m: PeerMember) => void }) {
  return (
    <button
      onClick={() => !m.done && onPick(m)}
      disabled={m.done}
      className={
        "flex items-center justify-between w-full rounded-xl border px-4 py-3 mb-2 text-left " +
        (m.done ? "border-blind/40 bg-blind/10 cursor-default" : "border-line bg-white")
      }
    >
      <span className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-panel font-bold text-sm shrink-0">
          {m.name.slice(0, 1)}
        </span>
        <span className="font-semibold">
          {m.name}
          {m.role !== "팀원" && (
            <span className="ml-1.5 rounded-full bg-accent text-white text-[11px] font-bold px-2 py-0.5">
              {m.role}
            </span>
          )}
        </span>
      </span>
      <span className={"text-sm font-semibold " + (m.done ? "text-blind" : "text-faint")}>
        {m.done ? "완료" : "채우러 가기"}
      </span>
    </button>
  );
}

export default function PeerListPage() {
  const router = useRouter();
  const [members, setMembers] = useState<PeerMember[] | null>(null);
  const [drillTeam, setDrillTeam] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/peer/status")
      .then((r) => r.json())
      .then((d) => setMembers(d.members ?? []));
  }, []);

  const pick = (m: PeerMember) => router.push(`/peer/${m.id}`);

  const head = useMemo(() => members?.find((m) => m.team === null), [members]);
  const byTeam = useMemo(() => {
    const map = new Map<string, PeerMember[]>();
    for (const t of TEAM_NAMES) map.set(t, []);
    members?.forEach((m) => {
      if (m.team) map.get(m.team)?.push(m);
    });
    return map;
  }, [members]);

  if (members === null) {
    return (
      <div className="pt-10">
        <p className="text-sub">불러오는 중…</p>
      </div>
    );
  }

  const doneCount = members.filter((m) => m.done).length;

  if (drillTeam) {
    const list = byTeam.get(drillTeam) ?? [];
    return (
      <div className="pt-10">
        <button className="text-sub text-sm inline-flex items-center gap-1.5" onClick={() => setDrillTeam(null)}>
          ← {DIVISION_NAME}
        </button>
        <h1 className="text-xl font-extrabold mt-3">
          {drillTeam} <span className="text-faint text-sm font-semibold">· {list.length}명</span>
        </h1>
        <div className="mt-4">
          {list.map((m) => (
            <PersonRow key={m.id} m={m} onPick={pick} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10">
      <button className="text-sub text-sm" onClick={() => router.push("/home")}>
        ← 홈으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3 text-blind">◆ 동료의 창 채우기</h1>
      <p className="text-sub mt-2 leading-relaxed">
        잘 아는 동료를 골라, 그 동료의 창에 담을 모습을 형용사로 골라줘요. 팀을 열어 이름을 선택하세요. 한 번 제출하면
        익명성 보호를 위해 수정할 수 없어요. ({doneCount}/{members.length}명 완료)
      </p>

      {head && (
        <div className="mt-5">
          <div className="text-xs font-bold text-faint tracking-wide mb-2">{DIVISION_NAME}</div>
          <PersonRow m={head} onPick={pick} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        {TEAM_NAMES.map((t) => {
          const list = byTeam.get(t) ?? [];
          const done = list.filter((m) => m.done).length;
          return (
            <button
              key={t}
              onClick={() => setDrillTeam(t)}
              className="flex items-center justify-between w-full rounded-xl border border-line bg-panel px-4 py-3.5 text-left"
            >
              <div>
                <div className="font-bold">{t}</div>
                <div className="text-xs text-sub mt-0.5">
                  {list.length}명
                  <span className={done >= list.length ? "text-blind" : "text-faint"}> · {done}/{list.length} 완료</span>
                </div>
              </div>
              <span className="text-faint">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
