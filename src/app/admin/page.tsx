"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ORG_MEMBERS } from "@/lib/org";

type Config = { deadline: string | null; closed: boolean; minEvaluators: number };
type MemberLink = { name: string; selfUrl: string; resultUrl: string };

export default function AdminPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [pickedMemberId, setPickedMemberId] = useState(ORG_MEMBERS[0]?.id ?? "");
  const [memberLink, setMemberLink] = useState<MemberLink | null>(null);
  const [linkError, setLinkError] = useState("");
  const [copied, setCopied] = useState<"self" | "result" | null>(null);

  const generateLink = async () => {
    setLinkError("");
    setMemberLink(null);
    const res = await fetch(`/api/admin/member-link?memberId=${encodeURIComponent(pickedMemberId)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setLinkError(data.error || "링크 생성에 실패했어요.");
    setMemberLink(data);
  };

  const copy = async (kind: "self" | "result", url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* 클립보드 접근이 막혀 있으면 그냥 무시 — 링크는 화면에 이미 보임 */
    }
  };

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

      <h2 className="text-lg font-extrabold mt-10">개인 링크 생성</h2>
      <p className="text-faint text-xs mt-2 leading-relaxed">
        진행 기간을 놓친 구성원(휴가 복귀 등)에게 로그인 없이 보낼 수 있는 자기평가 링크와 결과 링크를 만들어요.
        결과 링크는 마감 + 최소 응답자 수 조건을 그대로 따라요.
      </p>
      <div className="rounded-2xl bg-panel border border-line p-6 mt-4 space-y-4">
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-xl border border-line bg-white px-4 py-3"
            value={pickedMemberId}
            onChange={(e) => {
              setPickedMemberId(e.target.value);
              setMemberLink(null);
            }}
          >
            {ORG_MEMBERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.team ? ` · ${m.team}` : ""}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-accent text-white font-semibold px-5" onClick={generateLink}>
            생성
          </button>
        </div>
        {linkError && <p className="text-sm text-[#B4502E]">{linkError}</p>}
        {memberLink && (
          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold text-hidden">자기평가 링크 — {memberLink.name} 님에게 전달</div>
              <div className="flex gap-2 mt-1.5">
                <input readOnly className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm" value={memberLink.selfUrl} />
                <button className="rounded-xl bg-line px-3 text-sm font-semibold" onClick={() => copy("self", memberLink.selfUrl)}>
                  {copied === "self" ? "복사됨" : "복사"}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-blind">결과 링크 — {memberLink.name} 님에게 전달</div>
              <div className="flex gap-2 mt-1.5">
                <input readOnly className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm" value={memberLink.resultUrl} />
                <button className="rounded-xl bg-line px-3 text-sm font-semibold" onClick={() => copy("result", memberLink.resultUrl)}>
                  {copied === "result" ? "복사됨" : "복사"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
