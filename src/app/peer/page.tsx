"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PeerMember = { id: string; name: string; team: string | null; role: string; done: boolean };

export default function PeerListPage() {
  const router = useRouter();
  const [members, setMembers] = useState<PeerMember[] | null>(null);

  useEffect(() => {
    fetch("/api/peer/status")
      .then((r) => r.json())
      .then((d) => setMembers(d.members ?? []));
  }, []);

  return (
    <div className="pt-10">
      <button className="text-sub text-sm" onClick={() => router.push("/home")}>
        ← 홈으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3 text-blind">◆ 동료의 창 채우기</h1>
      <p className="text-sub mt-2 leading-relaxed">
        잘 아는 동료를 골라, 그 동료의 창에 담을 모습을 형용사로 골라줘요. 한 번 제출하면 익명성 보호를 위해 수정할 수 없어요.
      </p>
      <div className="mt-5 space-y-2">
        {members === null && <p className="text-sub">불러오는 중…</p>}
        {members?.map((m) => (
          <button
            key={m.id}
            onClick={() => !m.done && router.push(`/peer/${m.id}`)}
            disabled={m.done}
            className={
              "flex items-center justify-between w-full rounded-xl border px-4 py-3 text-left " +
              (m.done ? "border-blind/40 bg-blind/10 cursor-default" : "border-line bg-white")
            }
          >
            <span className="font-semibold">
              {m.name}{" "}
              <span className="text-faint font-medium text-sm">
                · {m.team ?? "인사실"}
                {m.role !== "팀원" ? ` · ${m.role}` : ""}
              </span>
            </span>
            <span className={"text-sm font-semibold " + (m.done ? "text-blind" : "text-faint")}>
              {m.done ? "완료" : "채우러 가기"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
