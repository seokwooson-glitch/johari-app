"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Config = { deadline: string | null; closed: boolean; minEvaluators: number };

export default function AdminPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => {
        if (r.status === 403) {
          setError("관리자만 접근할 수 있어요.");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setConfig(d.config));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaved(false);
    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) setSaved(true);
    else setError("저장에 실패했어요.");
  };

  return (
    <div className="pt-10">
      <button className="text-sub text-sm" onClick={() => router.push("/home")}>
        ← 홈으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3">진행 설정</h1>
      <p className="text-faint text-xs mt-2">진행자(실장)용 설정이에요.</p>

      {error && <p className="text-sm text-[#B4502E] mt-4">{error}</p>}

      {config && (
        <div className="rounded-2xl bg-panel border border-line p-6 mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-sub">마감 일시</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 mt-2"
              value={config.deadline ? config.deadline.slice(0, 16) : ""}
              onChange={(e) => setConfig({ ...config, deadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-sub">최소 응답자 수 (익명성 보호)</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 mt-2"
              value={config.minEvaluators}
              onChange={(e) => setConfig({ ...config, minEvaluators: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-sub">결과 공개(마감 처리)</span>
            <button
              onClick={() => setConfig({ ...config, closed: !config.closed })}
              className={
                "rounded-full px-4 py-2 text-sm font-semibold " +
                (config.closed ? "bg-accent text-white" : "bg-line text-sub")
              }
            >
              {config.closed ? "공개됨" : "비공개"}
            </button>
          </div>
          <button className="w-full rounded-xl bg-accent text-white font-semibold py-3" onClick={save}>
            저장
          </button>
          {saved && <p className="text-sm text-open">저장했어요.</p>}
        </div>
      )}
    </div>
  );
}
