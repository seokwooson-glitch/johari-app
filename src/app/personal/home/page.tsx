"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Account = {
  id: string;
  name: string;
  shareToken: string;
  closed: boolean;
  minEvaluators: number;
  hasSharePassword: boolean;
};

const cardCls = "rounded-2xl bg-panel border border-line p-5";

export default function PersonalHomePage() {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [selfCount, setSelfCount] = useState<number | null>(null);
  const [evaluatorCount, setEvaluatorCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/personal/me")
      .then((r) => r.json())
      .then((d) => setAccount(d.account));
    fetch("/api/personal/self-picks")
      .then((r) => r.json())
      .then((d) => setSelfCount(Array.isArray(d.adjectiveIds) ? d.adjectiveIds.length : 0));
    fetch("/api/personal/share")
      .then((r) => r.json())
      .then((d) => setEvaluatorCount(typeof d.evaluatorCount === "number" ? d.evaluatorCount : null));
  }, []);

  if (account === undefined) return <p className="pt-20 text-sub">불러오는 중…</p>;
  if (account === null) {
    if (typeof window !== "undefined") window.location.href = "/personal";
    return null;
  }

  const selfDone = (selfCount ?? 0) >= 5;

  return (
    <div className="pt-10 max-w-lg mx-auto">
      <Link href="/personal" className="text-sub text-sm">
        ← 나의 조하리의 창
      </Link>
      <h1 className="text-2xl font-extrabold mt-3">안녕하세요, {account.name} 님</h1>
      <p className="text-sub mt-2">
        {account.closed
          ? "마감됐어요 — 결과를 확인해보세요."
          : "링크를 공유해서 평가를 받아보세요. 마감 전까진 아무도(본인도) 결과를 볼 수 없어요."}
      </p>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link href="/personal/self" className={cardCls + " block"}>
          <div className="text-xs font-bold text-hidden">나를 고르기</div>
          <div className="font-bold text-lg mt-2">{selfDone ? "완료" : "시작 전"}</div>
          <div className="text-sub text-sm mt-1">최소 5개 형용사</div>
        </Link>
        <Link href="/personal/share" className={cardCls + " block"}>
          <div className="text-xs font-bold text-blind">평가 링크 공유</div>
          <div className="font-bold text-lg mt-2">{evaluatorCount ?? "…"}명</div>
          <div className="text-sub text-sm mt-1">평가 완료 (최소 {account.minEvaluators}명)</div>
        </Link>
      </div>

      <Link href="/personal/results" className={cardCls + " block mt-4"}>
        <div className="font-bold">나의 창</div>
        <div className="text-sub text-sm mt-1">
          {account.closed ? "결과 보러 가기" : "마감하면 여기서 열려요."}
        </div>
      </Link>
    </div>
  );
}
