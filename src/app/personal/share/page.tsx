"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ShareInfo = {
  shareToken: string;
  hasSharePassword: boolean;
  closed: boolean;
  minEvaluators: number;
  evaluatorCount: number;
  canClose: boolean;
};

const cardCls = "rounded-2xl bg-panel border border-line p-6 mt-6";
const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent";

export default function PersonalSharePage() {
  const router = useRouter();
  const [info, setInfo] = useState<ShareInfo | null>(null);
  const [pw, setPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = () =>
    fetch("/api/personal/share")
      .then((r) => r.json())
      .then((d) => setInfo(d));

  useEffect(() => {
    load();
  }, []);

  const link = info && typeof window !== "undefined" ? `${window.location.origin}/personal/r/${info.shareToken}` : "";

  const savePassword = async () => {
    setError("");
    if (pw.length < 4) return setError("비밀번호는 4자 이상으로 만들어주세요.");
    const res = await fetch("/api/personal/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || "저장에 실패했어요.");
    setPw("");
    setPwSaved(true);
    load();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한이 없으면 그냥 무시 — 링크는 화면에 그대로 보임 */
    }
  };

  const doClose = async () => {
    setError("");
    setClosing(true);
    try {
      const res = await fetch("/api/personal/close", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "마감에 실패했어요.");
      router.push("/personal/results");
    } finally {
      setClosing(false);
    }
  };

  if (!info) return <p className="pt-20 text-sub">불러오는 중…</p>;

  return (
    <div className="pt-10 max-w-lg mx-auto">
      <button className="text-sub text-sm" onClick={() => router.push("/personal/home")}>
        ← 홈으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3 text-blind">평가 링크 공유</h1>
      <p className="text-sub mt-2 leading-relaxed">
        이 링크를 받은 사람은 비밀번호를 입력하고 나를 평가할 수 있어요. 평가자는 계정이 필요 없고, 누가 뭘 골랐는지는
        저장되지 않아요.
      </p>

      <div className={cardCls}>
        <label className="text-sm font-semibold text-sub">평가 링크</label>
        <div className="flex gap-2 mt-2">
          <input className={inputCls} value={link} readOnly onFocus={(e) => e.target.select()} />
          <button
            className="shrink-0 rounded-xl bg-accent text-white font-semibold px-4"
            onClick={copyLink}
          >
            {copied ? "복사됨" : "복사"}
          </button>
        </div>

        <label className="text-sm font-semibold text-sub mt-5 block">
          {info.hasSharePassword ? "링크 비밀번호 변경" : "링크 비밀번호 설정"}
        </label>
        <div className="flex gap-2 mt-2">
          <input
            type="password"
            className={inputCls}
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setPwSaved(false);
            }}
            placeholder="4자 이상 · 평가자에게 이 비밀번호를 같이 알려주세요"
          />
          <button className="shrink-0 rounded-xl bg-panel border border-line font-semibold px-4" onClick={savePassword}>
            저장
          </button>
        </div>
        {pwSaved && <p className="text-sm text-open mt-2">비밀번호를 저장했어요. 평가자에게 링크와 함께 알려주세요.</p>}
        {!info.hasSharePassword && !pwSaved && (
          <p className="text-xs text-faint mt-2">아직 비밀번호가 없으면 누구나 링크만으로 평가할 수 있어요.</p>
        )}
        {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">
              {info.evaluatorCount}
              <span className="text-sub font-medium text-sm"> / 최소 {info.minEvaluators}명</span>
            </div>
            <div className="text-sub text-sm mt-1">
              {info.closed ? "이미 마감됐어요." : info.canClose ? "마감할 수 있어요." : "아직 평가자가 더 필요해요."}
            </div>
          </div>
          {info.closed ? (
            <button className="rounded-xl bg-panel border border-line font-semibold px-5 py-2.5" onClick={() => router.push("/personal/results")}>
              결과 보기
            </button>
          ) : (
            <button
              className="rounded-xl bg-accent text-white font-semibold px-5 py-2.5 disabled:opacity-40"
              onClick={doClose}
              disabled={!info.canClose || closing}
            >
              {closing ? "마감하는 중…" : "마감하기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
