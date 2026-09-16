"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClassifiedItem = { id: string; en: string; ko: string; cnt: number };
type ResultData = {
  available: boolean;
  reason?: "not_closed";
  evaluatorCount: number;
  minEvaluators: number;
  classified?: { open: ClassifiedItem[]; blind: ClassifiedItem[]; hidden: ClassifiedItem[]; unknownCount: number };
  indices?: { openness: number | null; consistency: number | null; o: number; b: number; h: number };
};

function Quad({ title, colorClass, items }: { title: string; colorClass: string; items: ClassifiedItem[] }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className={"font-bold text-sm " + colorClass}>{title}</div>
      {items.length === 0 ? (
        <p className="text-faint text-sm mt-2">없어요</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.map((it) => (
            <li key={it.id} className="text-sm flex justify-between">
              <span>{it.ko}</span>
              <span className="text-faint">{it.cnt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PersonalResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);

  useEffect(() => {
    fetch("/api/personal/results")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="pt-10 max-w-lg mx-auto">
      <button className="text-sub text-sm" onClick={() => router.push("/personal/home")}>
        ← 홈으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3">나의 창</h1>

      {!data && <p className="text-sub mt-4">불러오는 중…</p>}

      {data && !data.available && (
        <div className="rounded-xl border border-line bg-panel p-5 mt-4 text-sub">
          아직 마감 전이에요 (현재 {data.evaluatorCount}/{data.minEvaluators}명). "평가 링크 공유" 화면에서 마감하면 여기서
          볼 수 있어요.
        </div>
      )}

      {data?.available && data.classified && data.indices && (
        <>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl border border-line bg-panel p-4 text-center">
              <div className="text-2xl font-extrabold">{data.indices.openness ?? "–"}</div>
              <div className="text-xs text-sub mt-1">개방도</div>
            </div>
            <div className="rounded-xl border border-line bg-panel p-4 text-center">
              <div className="text-2xl font-extrabold">{data.indices.consistency ?? "–"}</div>
              <div className="text-xs text-sub mt-1">일치도</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <Quad title="열린 창" colorClass="text-open" items={data.classified.open} />
            <Quad title="보이지 않는 창" colorClass="text-blind" items={data.classified.blind} />
            <Quad title="숨겨진 창" colorClass="text-hidden" items={data.classified.hidden} />
            <div className="rounded-xl border border-line bg-panel p-4">
              <div className="font-bold text-sm text-unknown">미지의 창</div>
              <p className="text-faint text-sm mt-2">{data.classified.unknownCount}개 형용사</p>
            </div>
          </div>
          <p className="text-xs text-faint mt-4 leading-relaxed">
            총 {data.evaluatorCount}명이 응답했어요. 이 결과는 본인만 볼 수 있어요.
          </p>
        </>
      )}
    </div>
  );
}
