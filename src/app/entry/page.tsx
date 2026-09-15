"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Candidate = { id: string; name: string; team: string | null; role: string; hasPassword: boolean };

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent";
const cardCls = "rounded-2xl bg-panel border border-line p-6 mt-6";
const btnCls =
  "w-full rounded-xl bg-accent text-white font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed";

export default function EntryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setError("");
    const q = name.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: q }),
      });
      if (!res.ok) {
        setError("서버에 문제가 있어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      const data = await res.json();
      if (!data.candidates || data.candidates.length === 0) {
        setError("명단에서 찾지 못했어요. 이름을 확인해 주세요.");
        setCandidates([]);
      } else if (data.candidates.length === 1) {
        setSelected(data.candidates[0]);
        setCandidates(null);
      } else {
        setCandidates(data.candidates);
      }
    } catch {
      setError("연결에 문제가 있어요. 처음 접속이면 서버가 깨어나는 중일 수 있어요 — 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async () => {
    if (!selected) return;
    setError("");
    if (pw.length < 4) return setError("비밀번호는 4자 이상으로 만들어주세요.");
    if (!selected.hasPassword && pw !== pwConfirm) return setError("비밀번호가 서로 달라요.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "서버에 문제가 있어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      router.push("/home");
    } catch {
      setError("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (selected) {
    return (
      <div className="pt-20">
        <h1 className="text-2xl font-extrabold mt-4">{selected.name} 님</h1>
        <p className="text-sub mt-2 leading-relaxed">
          {selected.hasPassword
            ? "본인 확인을 위해 비밀번호를 입력해주세요."
            : "처음이시네요. 나중에 결과를 볼 때 본인 확인용으로 쓸 비밀번호를 만들어주세요."}
        </p>
        <div className={cardCls}>
          <label className="text-sm font-semibold text-sub">{selected.hasPassword ? "비밀번호" : "새 비밀번호"}</label>
          <input
            type="password"
            className={inputCls + " mt-2"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="4자 이상"
            onKeyDown={(e) => e.key === "Enter" && selected.hasPassword && submitPassword()}
          />
          {!selected.hasPassword && (
            <>
              <label className="text-sm font-semibold text-sub mt-4 block">비밀번호 확인</label>
              <input
                type="password"
                className={inputCls + " mt-2"}
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="한 번 더 입력해주세요"
                onKeyDown={(e) => e.key === "Enter" && submitPassword()}
              />
            </>
          )}
          {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
          <button className={btnCls + " mt-4"} onClick={submitPassword} disabled={loading}>
            {loading ? "확인하는 중…" : selected.hasPassword ? "확인하고 시작하기" : "설정하고 시작하기"}
          </button>
        </div>
        <button
          className="text-sm text-sub mt-4"
          onClick={() => {
            setSelected(null);
            setPw("");
            setPwConfirm("");
            setError("");
          }}
        >
          다른 이름으로 다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <h1 className="text-3xl font-extrabold mt-6">조하리의 창</h1>
      <p className="text-sub mt-3 leading-relaxed">
        이름을 입력하면 명단에서 찾아 시작해요. <span className="text-faint">본인 확인을 위해 비밀번호도 함께 사용해요.</span>
      </p>
      <div className={cardCls}>
        <label className="text-sm font-semibold text-sub">이름</label>
        <input
          className={inputCls + " mt-2"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 김지오"
          onKeyDown={(e) => e.key === "Enter" && lookup()}
        />
        {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
        {candidates && candidates.length > 1 && (
          <div className="mt-4">
            <p className="text-sm text-sub mb-2">같은 이름이 있어요. 본인의 팀을 골라주세요.</p>
            {candidates.map((c) => (
              <button
                key={c.id}
                className="flex items-center justify-between w-full rounded-xl border border-line bg-white px-4 py-3 mb-2 text-left"
                onClick={() => setSelected(c)}
              >
                <span className="font-semibold">
                  {c.name} <span className="text-faint font-medium">· {c.team ?? "인사실"}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        <button className={btnCls + " mt-4"} onClick={lookup} disabled={loading || !name.trim()}>
          {loading ? "찾는 중…" : "다음"}
        </button>
      </div>
    </div>
  );
}
