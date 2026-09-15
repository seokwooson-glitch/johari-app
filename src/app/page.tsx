"use client";
import { useEffect, useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Card, Btn } from "@/components/ui";
import { Sparkles, ChevronRight } from "@/components/icons";
import { QUAD } from "@/lib/johari";

type Quad = (typeof QUAD)[keyof typeof QUAD];

/* 프로토타입(johari_prototype.html)의 소개 화면을 그대로 이식 */

function WindowMark() {
  const cells = [QUAD.open.color, QUAD.blind.color, QUAD.hidden.color, QUAD.unknown.color];
  return (
    <div
      className="grid overflow-hidden rounded-2xl"
      style={{
        width: 76,
        height: 76,
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 3,
        background: "#2C2B33",
        padding: 3,
        boxShadow: "0 18px 40px -20px rgba(44,43,51,0.5)",
      }}
    >
      {cells.map((c, i) => (
        <div key={i} style={{ background: c, opacity: 0.9 }} />
      ))}
    </div>
  );
}

function MiniCell({ q, chips, empty }: { q: Quad; chips?: string[]; empty?: boolean }) {
  return (
    <div style={{ background: q.bg, border: `1px solid ${q.color}33`, borderRadius: 12, padding: "12px 12px 13px" }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: q.color }}>{q.label}</div>
      <div style={{ fontSize: 10.5, color: "#A6A2AC", marginBottom: 8 }}>{q.en}</div>
      {empty ? (
        <span style={{ fontSize: 11.5, color: "#A6A2AC" }}>…</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {chips?.map((c) => (
            <span
              key={c}
              className="rounded-full"
              style={{ background: "#fff", border: `1px solid ${q.color}44`, padding: "3px 8px", fontSize: 11.5, color: "#2C2B33" }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniWindow() {
  const vertical: CSSProperties = {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    textAlign: "center",
    fontSize: 10.5,
    fontWeight: 700,
    color: "#77747F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: "16px 1fr 1fr", gap: 6, alignItems: "center", marginBottom: 5 }}>
        <div />
        <div style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "#77747F" }}>동료가 아는</div>
        <div style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "#77747F" }}>동료가 모르는</div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "16px 1fr 1fr", gap: 6 }}>
        <div style={vertical}>내가 아는</div>
        <MiniCell q={QUAD.open} chips={["차분한", "논리적인"]} />
        <MiniCell q={QUAD.hidden} chips={["독립적인"]} />
        <div style={vertical}>내가 모르는</div>
        <MiniCell q={QUAD.blind} chips={["따뜻한", "친절한"]} />
        <MiniCell q={QUAD.unknown} empty />
      </div>
    </div>
  );
}

const QUAD_LIST: [Quad, string][] = [
  [QUAD.open, "나도 알고 동료도 아는 나"],
  [QUAD.blind, "나는 몰랐지만 동료는 아는 나"],
  [QUAD.hidden, "나는 알지만 안 드러낸 나"],
  [QUAD.unknown, "아직 아무도 모르는 나"],
];

export default function IntroPage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.member));
  }, []);

  return (
    <div style={{ paddingTop: 48, maxWidth: 620, margin: "0 auto" }}>
      <WindowMark />
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.8, marginTop: 24 }}>조하리의 창</h1>
      <p style={{ color: "#2C2B33", marginTop: 12, fontSize: 16.5, lineHeight: 1.7, fontWeight: 500 }}>
        내가 보는 나와, 동료가 보는 나. 이 둘을 겹쳐 보면 네 개의 창이 생겨요.
      </p>
      <p style={{ color: "#77747F", marginTop: 10, fontSize: 14.5, lineHeight: 1.75 }}>
        56개의 형용사 중에서 나를 가장 잘 나타내는 걸 고르고(최소 5개·5~6개 권장), 동료들도 나를 보고 골라줘요. 두
        선택을 겹치면, 나의 모습이 네 칸으로 나뉘어 보입니다.
      </p>

      <Card style={{ padding: 20, marginTop: 24 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <Sparkles size={16} color="#4C4CA6" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>결과는 이렇게 나와요</span>
          <span style={{ fontSize: 12, color: "#A6A2AC" }}>· 예시</span>
        </div>
        <MiniWindow />
      </Card>

      <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 14 }}>
        {QUAD_LIST.map(([q, desc]) => (
          <div
            key={q.en}
            className="flex items-center gap-2.5"
            style={{
              padding: "11px 13px",
              background: "#FCFBF7",
              border: "1px solid #E6E1D5",
              borderRadius: 12,
              borderLeft: `4px solid ${q.color}`,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: q.color }}>{q.label}</div>
              <div style={{ fontSize: 12, color: "#77747F", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "16px 18px", background: "#ECECF7", borderRadius: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#4C4CA6", marginBottom: 6 }}>왜 하나요</div>
        <p style={{ fontSize: 13.5, color: "#2C2B33", lineHeight: 1.7 }}>
          핵심은 <b>&lsquo;보이지 않는 창&rsquo;</b>이에요. 나는 몰랐지만 동료들이 공통으로 보는 내 모습을 확인하는
          거죠. 결과는 각자 <b>자기 것만</b> 보고, 동료가 골라준 것은 &lsquo;누가&rsquo;인지 없이 <b>익명으로</b> 모여요.
          남에게 보여줄지는 온전히 내 선택이고요. 점수를 매기거나 서로를 줄 세우려는 게 아니라, 나를 한 번 새로 보는
          계기를 만드는 활동이에요.
        </p>
      </div>

      <div style={{ marginTop: 26, textAlign: "center" }}>
        <Btn onClick={() => router.push(loggedIn ? "/home" : "/entry")} style={{ padding: "15px 40px", fontSize: 16.5 }}>
          {loggedIn ? "홈으로 계속하기" : "시작해 볼까요"} <ChevronRight size={18} />
        </Btn>
        <p style={{ fontSize: 12, color: "#A6A2AC", marginTop: 12 }}>3~5분이면 충분해요. 익명으로 집계됩니다.</p>
      </div>
    </div>
  );
}
