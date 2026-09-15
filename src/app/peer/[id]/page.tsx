"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdjectiveGrid from "@/components/AdjectiveGrid";
import { PICK_MIN } from "@/lib/adjectives";

type PeerMember = { id: string; name: string; team: string | null; role: string; done: boolean };

export default function PeerFillPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const targetId = params.id;
  const [target, setTarget] = useState<PeerMember | null | undefined>(undefined);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/peer/status")
      .then((r) => r.json())
      .then((d) => {
        const m = (d.members ?? []).find((x: PeerMember) => x.id === targetId);
        setTarget(m ?? null);
        if (m?.done) router.replace("/peer");
      });
  }, [targetId, router]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = async () => {
    setError("");
    if (selected.length < PICK_MIN) return setError(`최소 ${PICK_MIN}개를 골라주세요.`);
    setSaving(true);
    try {
      const res = await fetch("/api/peer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, adjectiveIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "제출에 실패했어요.");
      router.push("/peer");
    } finally {
      setSaving(false);
    }
  };

  if (target === undefined) return <p className="pt-20 text-sub">불러오는 중…</p>;
  if (target === null) return <p className="pt-20 text-sub">대상을 찾을 수 없어요.</p>;

  return (
    <div className="pt-10">
      <button className="text-sub text-sm" onClick={() => router.push("/peer")}>
        ← 목록으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3 text-blind">{target.name} 님 창 채우기</h1>
      <p className="text-sub mt-2 leading-relaxed">
        {target.name} 님에게서 보이는 걸 가장 잘 나타내는 형용사를 골라주세요. 최소 5개(5~6개 권장). 제출 후엔 수정할 수 없어요.
      </p>
      <AdjectiveGrid selected={selected} onToggle={toggle} accentClass="border-blind bg-blind text-white" />
      {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
      <div className="sticky bottom-0 mt-6 bg-paper/95 backdrop-blur py-3 border-t border-line flex items-center justify-between">
        <span className="text-sm text-sub">{selected.length}개 선택됨</span>
        <button
          className="rounded-xl bg-blind text-white font-semibold px-6 py-2.5 disabled:opacity-40"
          onClick={save}
          disabled={saving}
        >
          제출하기
        </button>
      </div>
    </div>
  );
}
