"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent";
const cardCls = "rounded-2xl bg-panel border border-line p-6 mt-6";
const btnCls =
  "w-full rounded-xl bg-accent text-white font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed";

export default function PersonalLandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("이름을 입력해주세요.");
    if (password.length < 4) return setError("비밀번호는 4자 이상으로 만들어주세요.");
    if (mode === "signup" && password !== confirm) return setError("비밀번호가 서로 달라요.");

    setLoading(true);
    try {
      const res = await fetch(`/api/personal/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "문제가 발생했어요.");
      router.push("/personal/home");
    } catch {
      setError("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 max-w-lg mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">나의 조하리의 창</h1>
      <p className="text-sub mt-3 leading-relaxed">
        소속 없이 누구나 만들 수 있는 개인용 페이지예요. 계정을 만들고 내 형용사를 고른 뒤, 평가 링크를 친구·동료에게
        공유해서 익명으로 평가를 받아보세요.
      </p>

      <div className="flex gap-2 mt-6">
        <button
          className={
            "flex-1 rounded-xl py-2.5 font-semibold text-sm " +
            (mode === "signup" ? "bg-accent text-white" : "bg-panel border border-line text-sub")
          }
          onClick={() => {
            setMode("signup");
            setError("");
          }}
        >
          계정 만들기
        </button>
        <button
          className={
            "flex-1 rounded-xl py-2.5 font-semibold text-sm " +
            (mode === "login" ? "bg-accent text-white" : "bg-panel border border-line text-sub")
          }
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          로그인
        </button>
      </div>

      <div className={cardCls}>
        <label className="text-sm font-semibold text-sub">이름</label>
        <input className={inputCls + " mt-2"} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김지오" />

        <label className="text-sm font-semibold text-sub mt-4 block">비밀번호</label>
        <input
          type="password"
          className={inputCls + " mt-2"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="4자 이상"
        />

        {mode === "signup" && (
          <>
            <label className="text-sm font-semibold text-sub mt-4 block">비밀번호 확인</label>
            <input
              type="password"
              className={inputCls + " mt-2"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="한 번 더 입력해주세요"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </>
        )}

        {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}

        <button className={btnCls + " mt-5"} onClick={submit} disabled={loading}>
          {loading ? "처리 중…" : mode === "signup" ? "계정 만들고 시작하기" : "로그인"}
        </button>
        {mode === "login" && (
          <p className="text-xs text-faint mt-3 leading-relaxed">
            이름은 다른 사람과 겹칠 수 있어서, 이름+비밀번호 조합으로 본인 계정을 찾아요.
          </p>
        )}
      </div>
    </div>
  );
}
