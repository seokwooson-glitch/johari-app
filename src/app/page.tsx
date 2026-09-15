"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { QUAD } from "@/lib/johari";

const QUAD_ROWS: { key: keyof typeof QUAD; desc: string }[] = [
  { key: "open", desc: "나도 알고 동료도 아는 나" },
  { key: "blind", desc: "나는 몰랐지만 동료는 아는 나" },
  { key: "hidden", desc: "나는 알지만 안 드러낸 나" },
  { key: "unknown", desc: "아직 아무도 모르는 나" },
];

const colorClass: Record<string, string> = {
  open: "text-open border-open",
  blind: "text-blind border-blind",
  hidden: "text-hidden border-hidden",
  unknown: "text-unknown border-unknown",
};

export default function IntroPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.member));
  }, []);

  return (
    <div className="pt-14 max-w-lg mx-auto">
      <div className="w-10 h-10 rounded-xl bg-accent" aria-hidden />
      <h1 className="text-3xl font-extrabold mt-6 tracking-tight">조하리의 창</h1>
      <p className="text-ink mt-3 text-base leading-relaxed font-medium">
        내가 보는 나와, 동료가 보는 나. 이 둘을 겹쳐 보면 네 개의 창이 생겨요.
      </p>
      <p className="text-sub mt-2.5 text-sm leading-relaxed">
        56개의 형용사 중에서 나를 가장 잘 나타내는 걸 고르고(최소 5개·5~6개 권장), 동료들도 나를 보고 골라줘요. 두
        선택을 겹치면, 나의 모습이 네 칸으로 나뉘어 보입니다.
      </p>

      <div className="rounded-2xl bg-panel border border-line p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold">결과는 이렇게 나와요</span>
          <span className="text-xs text-faint">· 예시</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {QUAD_ROWS.map(({ key, desc }) => (
            <div
              key={key}
              className={"rounded-xl bg-white border border-line border-l-4 px-3.5 py-2.5 " + colorClass[key]}
            >
              <div className={"font-bold text-sm " + colorClass[key].split(" ")[0]}>{QUAD[key].label}</div>
              <div className="text-xs text-sub mt-0.5 leading-snug">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-accent/10 p-5 mt-4">
        <div className="font-bold text-sm text-accent mb-1.5">왜 하나요</div>
        <p className="text-sm text-ink leading-relaxed">
          핵심은 <b>&lsquo;보이지 않는 창&rsquo;</b>이에요. 나는 몰랐지만 동료들이 공통으로 보는 내 모습을 확인하는
          거죠. 결과는 각자 <b>자기 것만</b> 보고, 동료가 골라준 것은 &lsquo;누가&rsquo;인지 없이 <b>익명으로</b>{" "}
          모여요. 점수를 매기거나 서로를 줄 세우려는 게 아니라, 나를 한 번 새로 보는 계기를 만드는 활동이에요.
        </p>
      </div>

      <div className="mt-7 text-center">
        <Link
          href={loggedIn ? "/home" : "/entry"}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent text-white font-semibold px-9 py-3.5 text-base"
        >
          {loggedIn ? "홈으로 계속하기" : "시작해 볼까요"} →
        </Link>
        <p className="text-xs text-faint mt-3">3~5분이면 충분해요. 익명으로 집계됩니다.</p>
      </div>
    </div>
  );
}
