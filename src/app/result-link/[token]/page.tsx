"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResultView from "@/components/ResultView";
import type { MemberResult } from "@/lib/memberResult";

export default function ResultLinkPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<MemberResult | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/result-link/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null));
  }, [token]);

  if (data === undefined) return <p className="pt-20 text-sub text-center">불러오는 중…</p>;
  if (data === null) {
    return (
      <div className="pt-20 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold">링크를 찾을 수 없어요</h1>
        <p className="text-sub mt-2">주소를 다시 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="pt-10 max-w-lg mx-auto">
      <ResultView data={data} />
    </div>
  );
}
