"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdjectiveGrid from "@/components/AdjectiveGrid";
import { PICK_MIN } from "@/lib/adjectives";

type LinkInfo = { ownerName: string; closed: boolean; requiresPassword: boolean };

function getEvaluatorToken(token: string): string {
  const key = `johari_evaluator_${token}`;
  let value = "";
  try {
    value = localStorage.getItem(key) || "";
    if (!value) {
      value = crypto.randomUUID();
      localStorage.setItem(key, value);
    }
  } catch {
    value = crypto.randomUUID(); // 저장이 안 되면(사생활 보호 모드 등) 이번 제출만이라도 진행
  }
  return value;
}

function alreadySubmitted(token: string): boolean {
  try {
    return localStorage.getItem(`johari_submitted_${token}`) === "1";
  } catch {
    return false;
  }
}
function markSubmitted(token: string) {
  try {
    localStorage.setItem(`johari_submitted_${token}`, "1");
  } catch {
    /* 무시 */
  }
}

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent";
const cardCls = "rounded-2xl bg-panel border border-line p-6 mt-6";
const btnCls = "w-full rounded-xl bg-accent text-white font-semibold py-3 disabled:opacity-40";

export default function EvaluateLinkPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [info, setInfo] = useState<LinkInfo | null | undefined>(undefined);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/personal/r/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setInfo)
      .catch(() => setInfo(null));
    setDone(alreadySubmitted(token));
  }, [token]);

  const verify = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/personal/r/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "확인에 실패했어요.");
      setUnlocked(true);
    } catch {
      setError("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async () => {
    setError("");
    if (selected.length < PICK_MIN) return setError(`최소 ${PICK_MIN}개를 골라주세요.`);
    setLoading(true);
    try {
      const res = await fetch(`/api/personal/r/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, adjectiveIds: selected, evaluatorToken: getEvaluatorToken(token) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "제출에 실패했어요.");
      markSubmitted(token);
      setDone(true);
    } catch {
      setError("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (info === undefined) return <p className="pt-20 text-sub text-center">불러오는 중…</p>;
  if (info === null) {
    return (
      <div className="pt-20 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold">링크를 찾을 수 없어요</h1>
        <p className="text-sub mt-2">주소를 다시 확인해주세요.</p>
      </div>
    );
  }

  if (info.closed) {
    return (
      <div className="pt-20 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold">이미 마감된 링크예요</h1>
        <p className="text-sub mt-2">{info.ownerName} 님이 평가를 마감했어요. 더 이상 제출할 수 없어요.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="pt-20 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold text-blind">제출 완료!</h1>
        <p className="text-sub mt-2">{info.ownerName} 님을 평가해주셔서 고마워요. 익명으로 안전하게 반영됐어요.</p>
      </div>
    );
  }

  if (!unlocked && info.requiresPassword) {
    return (
      <div className="pt-16 max-w-lg mx-auto">
        <h1 className="text-2xl font-extrabold">{info.ownerName} 님 평가하기</h1>
        <p className="text-sub mt-2 leading-relaxed">{info.ownerName} 님에게 받은 비밀번호를 입력해주세요.</p>
        <div className={cardCls}>
          <input
            type="password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            onKeyDown={(e) => e.key === "Enter" && verify()}
          />
          {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
          <button className={btnCls + " mt-4"} onClick={verify} disabled={loading}>
            {loading ? "확인하는 중…" : "확인"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold text-blind">{info.ownerName} 님 평가하기</h1>
      <p className="text-sub mt-2 leading-relaxed">
        {info.ownerName} 님에게서 보이는 걸 가장 잘 나타내는 형용사를 골라주세요. 최소 5개(5~6개 권장) · 익명으로
        반영돼요.
      </p>
      <AdjectiveGrid selected={selected} onToggle={toggle} accentClass="border-blind bg-blind text-white" />
      {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
      <div className="sticky bottom-0 mt-6 bg-paper/95 backdrop-blur py-3 border-t border-line flex items-center justify-between">
        <span className="text-sm text-sub">{selected.length}개 선택됨</span>
        <button className="rounded-xl bg-blind text-white font-semibold px-6 py-2.5 disabled:opacity-40" onClick={submit} disabled={loading}>
          {loading ? "제출하는 중…" : "제출하기"}
        </button>
      </div>
    </div>
  );
}
