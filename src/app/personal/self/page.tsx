"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdjectiveGrid from "@/components/AdjectiveGrid";
import { PICK_MIN } from "@/lib/adjectives";

export default function PersonalSelfPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/personal/self-picks")
      .then((r) => r.json())
      .then((d) => setSelected(d.adjectiveIds ?? []));
  }, []);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = async () => {
    setError("");
    if (selected.length < PICK_MIN) return setError(`최소 ${PICK_MIN}개를 골라주세요.`);
    setSaving(true);
    try {
      const res = await fetch("/api/personal/self-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjectiveIds: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "저장에 실패했어요.");
      router.push("/personal/home");
    } catch {
      setError("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-10 max-w-lg mx-auto">
      <button className="text-sub text-sm" onClick={() => router.push("/personal/home")}>
        ← 홈으로
      </button>
      <h1 className="text-2xl font-extrabold mt-3 text-hidden">나를 고르기</h1>
      <p className="text-sub mt-2 leading-relaxed">
        스스로 생각하기에 나를 가장 잘 나타내는 형용사를 골라주세요. 최소 5개(5~6개 권장) · 가장 두드러진 것만.
      </p>
      <AdjectiveGrid selected={selected} onToggle={toggle} accentClass="border-hidden bg-hidden text-white" />
      {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
      <div className="sticky bottom-0 mt-6 bg-paper/95 backdrop-blur py-3 border-t border-line flex items-center justify-between">
        <span className="text-sm text-sub">{selected.length}개 선택됨</span>
        <button
          className="rounded-xl bg-hidden text-white font-semibold px-6 py-2.5 disabled:opacity-40"
          onClick={save}
          disabled={saving}
        >
          {saving ? "저장하는 중…" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
