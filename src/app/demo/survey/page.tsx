"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AdjectiveGrid from "@/components/AdjectiveGrid";
import { PICK_MIN } from "@/lib/adjectives";
import { DEMO_PICKS_KEY } from "@/lib/demoData";

export default function DemoSurveyPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    setError("");
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const submit = () => {
    if (selected.length < PICK_MIN) return setError(`${PICK_MIN - selected.length}개 더 골라주세요 (최소 ${PICK_MIN}개)`);
    try {
      sessionStorage.setItem(DEMO_PICKS_KEY, JSON.stringify(selected));
    } catch {
      // 저장이 막혀 있어도 결과 샘플은 기본값으로 볼 수 있다.
    }
    router.push("/demo/result");
  };

  return (
    <div className="pt-14 max-w-lg mx-auto">
      <div className="inline-block rounded-full border border-line bg-panel px-3 py-1 text-xs font-semibold text-sub">
        체험용 샘플 · 선택한 내용은 저장되지 않아요
      </div>
      <h1 className="text-2xl font-extrabold text-hidden mt-3">나를 고르기</h1>
      <p className="text-sub mt-2 leading-relaxed">
        스스로 생각하기에 나를 가장 잘 나타내는 형용사를 골라주세요. 최소 5개(5~6개 권장) · 가장 두드러진 것만.
        동료를 평가할 때도 같은 화면에서 동료에게 보이는 모습을 고릅니다.
      </p>
      <AdjectiveGrid selected={selected} onToggle={toggle} accentClass="border-hidden bg-hidden text-white" />
      <div className="sticky bottom-0 mt-6 bg-paper/95 backdrop-blur py-3 border-t border-line flex items-center justify-between gap-3">
        <span className={"text-sm " + (error ? "text-[#B4502E] font-semibold" : "text-sub")}>
          {error || `${selected.length}개 선택됨 (최소 ${PICK_MIN}개)`}
        </span>
        <button
          className={
            "rounded-xl bg-hidden text-white font-semibold px-6 py-2.5 shrink-0 " +
            (selected.length < PICK_MIN ? "opacity-50" : "")
          }
          onClick={submit}
        >
          결과 샘플 보기
        </button>
      </div>
    </div>
  );
}
