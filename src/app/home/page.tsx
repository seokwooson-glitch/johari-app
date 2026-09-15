"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Me = { id: string; name: string; team: string | null; role: string };

const cardCls = "rounded-2xl bg-panel border border-line p-5";

export default function HomePage() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [selfCount, setSelfCount] = useState<number | null>(null);
  const [peerDone, setPeerDone] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setMe(d.member));
    fetch("/api/self-picks")
      .then((r) => r.json())
      .then((d) => setSelfCount(Array.isArray(d.adjectiveIds) ? d.adjectiveIds.length : 0));
    fetch("/api/peer/status")
      .then((r) => r.json())
      .then((d) => {
        const members = d.members ?? [];
        setPeerDone({ done: members.filter((m: any) => m.done).length, total: members.length });
      });
  }, []);

  if (me === undefined) return <p className="pt-20 text-sub">불러오는 중…</p>;
  if (me === null) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  const selfDone = (selfCount ?? 0) >= 5;

  return (
    <div className="pt-10">
      <h1 className="text-2xl font-extrabold">안녕하세요, {me.name} 님</h1>
      <p className="text-sub mt-2">이름과 비밀번호로 본인 확인된 상태예요.</p>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link href="/self" className={cardCls + " block"}>
          <div className="text-xs font-bold text-hidden">나를 고르기</div>
          <div className="font-bold text-lg mt-2">{selfDone ? "완료" : "시작 전"}</div>
          <div className="text-sub text-sm mt-1">최소 5개 형용사</div>
        </Link>
        <Link href="/peer" className={cardCls + " block"}>
          <div className="text-xs font-bold text-blind">동료의 창 채우기</div>
          <div className="font-bold text-lg mt-2">
            {peerDone ? `${peerDone.done}/${peerDone.total}` : "…"}
          </div>
          <div className="text-sub text-sm mt-1">완료</div>
        </Link>
      </div>

      <Link href="/results" className={cardCls + " block mt-4"}>
        <div className="font-bold">나의 창</div>
        <div className="text-sub text-sm mt-1">기간이 끝나고 응답이 충분히 모이면 여기서 열려요.</div>
      </Link>

      {me.role === "실장" && (
        <Link href="/admin" className="block mt-6 text-sm text-sub underline">
          진행 설정(관리자)
        </Link>
      )}
    </div>
  );
}
