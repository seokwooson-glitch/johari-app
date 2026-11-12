"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ResultView from "@/components/ResultView";
import { buildDemoResult, DEMO_DEFAULT_SELF, DEMO_PICKS_KEY } from "@/lib/demoData";
import type { MemberResult } from "@/lib/memberResult";

export default function DemoResultPage() {
  const [data, setData] = useState<MemberResult | null>(null);
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    let picks: string[] | null = null;
    try {
      const raw = sessionStorage.getItem(DEMO_PICKS_KEY);
      if (raw) picks = JSON.parse(raw);
    } catch {
      picks = null;
    }
    const valid = Array.isArray(picks) && picks.length > 0;
    setCustom(valid);
    setData(buildDemoResult(valid ? (picks as string[]) : DEMO_DEFAULT_SELF));
  }, []);

  if (!data) return <p className="pt-20 text-sub text-center">불러오는 중…</p>;

  return (
    <div className="pt-10 max-w-lg mx-auto">
      <div className="inline-block rounded-full border border-line bg-panel px-3 py-1 text-xs font-semibold text-sub">
        체험용 샘플 · 동료 응답 5명은 가상의 데이터예요
      </div>
      <p className="text-sub text-sm mt-3 leading-relaxed">
        {custom
          ? "방금 고른 형용사와 가상의 동료 응답을 겹친 결과예요."
          : "미리 정해 둔 예시 선택과 가상의 동료 응답을 겹친 결과예요."}
      </p>
      <div className="mt-4">
        <ResultView data={data} />
      </div>
      <div className="mt-8">
        <Link href="/demo/survey" className="text-sm font-semibold text-hidden underline">
          다시 골라 보기
        </Link>
      </div>
    </div>
  );
}
