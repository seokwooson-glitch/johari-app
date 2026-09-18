"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { ArrowLeft, Sparkles } from "@/components/icons";
import { QUAD } from "@/lib/johari";

type Quad = (typeof QUAD)[keyof typeof QUAD];
type ClassifiedItem = { id: string; en: string; ko: string; cnt: number };
type ResultData = {
  available: boolean;
  reason?: "not_closed";
  evaluatorCount: number;
  minEvaluators: number;
  classified?: { open: ClassifiedItem[]; blind: ClassifiedItem[]; hidden: ClassifiedItem[]; unknownCount: number };
  indices?: { openness: number | null; consistency: number | null; o: number; b: number; h: number };
};

// 프로토타입(johari_prototype.html)의 ResultsView를 그대로 이식.

function MetricCard({
  label,
  value,
  color,
  formula,
  desc,
}: {
  label: string;
  value: number | null;
  color: string;
  formula: string;
  desc: string;
}) {
  return (
    <div className="flex-1 rounded-2xl border border-line bg-panel p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-bold">{label}</span>
        <span className="text-2xl font-extrabold" style={{ color }}>
          {value == null ? "–" : value + "%"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-line mt-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: (value || 0) + "%", background: color }}
        />
      </div>
      <div
        className="inline-block text-[11px] font-semibold rounded-md mt-2.5 px-2 py-1"
        style={{ color, background: color + "14" }}
      >
        {formula}
      </div>
      <div className="text-xs text-sub mt-2 leading-relaxed">{desc}</div>
    </div>
  );
}

function Pane({
  q,
  items,
  evaluators,
  unknownCount,
}: {
  q: Quad;
  items: ClassifiedItem[];
  evaluators: number;
  unknownCount?: number;
}) {
  const isUnknown = q.en === "Unknown";
  return (
    <div className="rounded-2xl p-4" style={{ background: q.bg, border: `1px solid ${q.color}33`, minHeight: 168 }}>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-extrabold text-base" style={{ color: q.color }}>
            {q.label}
          </span>
          <span className="text-faint text-[11.5px]">{q.en}</span>
        </div>
        <span className="text-[12.5px] font-bold" style={{ color: q.color }}>
          {isUnknown ? `${unknownCount}개` : `${items.length}개`}
        </span>
      </div>
      {isUnknown ? (
        <p className="text-sub text-sm leading-relaxed">
          누구도 고르지 않은 형용사 {unknownCount}개. 아직 드러나지 않은 가능성의 자리예요.
        </p>
      ) : items.length === 0 ? (
        <p className="text-faint text-sm">해당하는 형용사가 없어요.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-sm"
              style={{ border: `1px solid ${q.color}44` }}
              title={a.en}
            >
              {a.ko}
              {q.en !== "Hidden" && evaluators > 0 && (
                <span className="text-[11px] font-bold" style={{ color: q.color }}>
                  {a.cnt}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AxisLabel({ text }: { text: string }) {
  return <div className="text-center text-[12.5px] font-bold text-sub tracking-wide">{text}</div>;
}
function SideLabel({ text }: { text: string }) {
  return (
    <div
      className="self-stretch flex items-center justify-center text-center text-[12.5px] font-bold text-sub tracking-widest"
      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
    >
      {text}
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

  if (!data) return <p className="pt-20 text-sub">불러오는 중…</p>;

  if (!data.available) {
    return (
      <div className="pt-6 max-w-lg mx-auto">
        <button className="text-sub text-sm inline-flex items-center gap-1.5" onClick={() => router.push("/personal/home")}>
          <ArrowLeft size={16} /> 홈으로
        </button>
        <h1 className="text-2xl font-extrabold mt-3">나의 창</h1>
        <div className="rounded-xl border border-line bg-panel p-5 mt-4 text-sub">
          아직 마감 전이에요 (현재 {data.evaluatorCount}/{data.minEvaluators}명). "평가 링크 공유" 화면에서 마감하면 여기서
          볼 수 있어요.
        </div>
      </div>
    );
  }

  const { classified, indices, evaluatorCount } = data;
  if (!classified || !indices) return null;
  const topBlind = classified.blind[0];

  return (
    <div className="pt-6 max-w-lg mx-auto">
      <button className="text-sub text-sm inline-flex items-center gap-1.5" onClick={() => router.push("/personal/home")}>
        <ArrowLeft size={16} /> 홈으로
      </button>

      <div className="mt-3">
        <h1 className="text-[27px] font-extrabold tracking-tight">나의 창</h1>
        <p className="text-sub text-sm mt-1.5">
          {evaluatorCount > 0 ? `평가자 ${evaluatorCount}명이 내 창을 채워 주었어요.` : "아직 내 창을 채워 준 사람이 없어요."}{" "}
          숫자는 그 형용사를 고른 사람 수예요.
        </p>
      </div>

      {evaluatorCount > 0 && (
        <div className="flex gap-3 mt-4">
          <MetricCard
            label="개방도"
            value={indices.openness}
            color="#7A5AA6"
            formula="열린 창 ÷ (열린 창 + 숨겨진 창)"
            desc="내가 아는 나 중에서 남에게도 보이는 비율. 자기개방의 정도예요 — 높을수록 숨겨진 창이 작아요."
          />
        </div>
      )}

      <div className="mt-5">
        <div className="grid gap-2.5 items-center" style={{ gridTemplateColumns: "22px 1fr 1fr" }}>
          <div />
          <AxisLabel text="남이 아는" />
          <AxisLabel text="남이 모르는" />
        </div>
        <div className="grid gap-2.5 mt-2" style={{ gridTemplateColumns: "22px 1fr 1fr" }}>
          <SideLabel text="내가 아는" />
          <Pane q={QUAD.open} items={classified.open} evaluators={evaluatorCount} />
          <Pane q={QUAD.hidden} items={classified.hidden} evaluators={evaluatorCount} />
          <SideLabel text="내가 모르는" />
          <Pane q={QUAD.blind} items={classified.blind} evaluators={evaluatorCount} />
          <Pane q={QUAD.unknown} items={[]} evaluators={evaluatorCount} unknownCount={classified.unknownCount} />
        </div>
      </div>

      {topBlind && (
        <Card className="flex gap-3.5 items-start" style={{ padding: 18, marginTop: 18 }}>
          <Sparkles size={20} color={QUAD.blind.color} className="mt-0.5 shrink-0" />
          <p className="text-[14.5px] leading-relaxed">
            {topBlind.cnt}명이 공통으로 <b style={{ color: QUAD.blind.color }}>{topBlind.ko}</b>({topBlind.en})을(를)
            골랐는데, 스스로는 그렇게 생각하지 않았어요. 좋다·나쁘다를 떠나, 이 모습이 어떻게 느껴지세요?
          </p>
        </Card>
      )}

      <h2 className="text-lg font-extrabold mt-8 mb-3">창 해석 가이드</h2>
      <div className="grid grid-cols-1 gap-3">
        {(["open", "blind", "hidden", "unknown"] as const).map((k) => {
          const q = QUAD[k];
          return (
            <div key={k} className="rounded-xl bg-panel border border-line p-4" style={{ borderLeft: `4px solid ${q.color}` }}>
              <div className="font-bold text-[15px]" style={{ color: q.color }}>
                {q.label}
              </div>
              <div className="text-sub text-[13.5px] leading-relaxed mt-1.5">{q.meaning}</div>
            </div>
          );
        })}
      </div>

      <p className="text-faint text-xs mt-5 leading-relaxed">
        조하리의 창은 진단이 아니라 대화의 출발점이에요. "왜 이 단어가 여기 있을까"를 스스로 이야기해보는 과정에
        가장 큰 가치가 있어요.
      </p>
    </div>
  );
}
