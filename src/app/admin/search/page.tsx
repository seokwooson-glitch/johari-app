"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ResultView from "@/components/ResultView";
import { ORG_MEMBERS } from "@/lib/org";
import type { MemberResult } from "@/lib/memberResult";

export default function AdminSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [result, setResult] = useState<MemberResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ORG_MEMBERS;
    return ORG_MEMBERS.filter((m) => m.name.toLowerCase().includes(q) || (m.team ?? "").toLowerCase().includes(q));
  }, [query]);

  const open = async (id: string) => {
    setPickedId(id);
    setResult(null);
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/member-result?memberId=${encodeURIComponent(id)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 403 ? "관리자만 접근할 수 있어요." : data.error || "조회에 실패했어요.");
        return;
      }
      setResult(data);
    } catch {
      setError("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-10 max-w-lg mx-auto">
      <button className="text-sub text-sm" onClick={() => router.push("/admin")}>
        ← 진행 설정으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3">개인별 결과 검색</h1>
      <p className="text-faint text-xs mt-2 leading-relaxed">
        이름이나 팀으로 찾아 그 사람의 창을 바로 확인해요. 결과 공개 조건(마감 + 최소 응답자 수)은 본인이 볼 때와 같아요.
      </p>

      <input
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent mt-5"
        placeholder="이름 또는 팀 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <div className="flex flex-wrap gap-2 mt-3">
        {matches.length === 0 && <p className="text-sm text-faint">일치하는 구성원이 없어요.</p>}
        {matches.map((m) => (
          <button
            key={m.id}
            onClick={() => open(m.id)}
            className={
              "rounded-full border px-3 py-1.5 text-sm " +
              (pickedId === m.id ? "border-accent bg-accent text-white" : "border-line bg-white text-ink")
            }
          >
            {m.name}
            {m.team ? <span className="opacity-60"> · {m.team}</span> : null}
          </button>
        ))}
      </div>

      <div className="mt-8 border-t border-line pt-6">
        {loading && <p className="text-sub">불러오는 중…</p>}
        {error && <p className="text-sm text-[#B4502E]">{error}</p>}
        {result && <ResultView data={result} />}
        {!pickedId && !loading && <p className="text-faint text-sm">위에서 구성원을 선택하면 결과가 여기에 표시돼요.</p>}
      </div>
    </div>
  );
}
