"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdjectiveGrid from "@/components/AdjectiveGrid";
import { PICK_MIN } from "@/lib/adjectives";

type Info = { name: string; adjectiveIds: string[] };

const btnCls = "rounded-xl bg-hidden text-white font-semibold px-6 py-2.5 disabled:opacity-40";

export default function SelfLinkPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [info, setInfo] = useState<Info | null | undefined>(undefined);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/self-link/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Info) => {
        setInfo(d);
        setSelected(d.adjectiveIds ?? []);
      })
      .catch(() => setInfo(null));
  }, [token]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = async () => {
    setError("");
    if (selected.length < PICK_MIN) return setError(`최소 ${PICK_MIN}개를 골라주세요.`);
    setSaving(true);
    try {
      const res = await fetch(`/api/self-link/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjectiveIds: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "저장에 실패했어요.");
      setDone(true);
    } catch {
      setError("연결에 문제가 있어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
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

  if (done) {
    return (
      <div className="pt-20 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold text-hidden">저장 완료!</h1>
        <p className="text-sub mt-2 leading-relaxed">
          {info.name} 님의 자기평가가 저장됐어요. 결과 링크는 진행자에게 다시 안내받으실 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-14 max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold text-hidden">{info.name} 님, 나를 고르기</h1>
      <p className="text-sub mt-2 leading-relaxed">
        스스로 생각하기에 나를 가장 잘 나타내는 형용사를 골라주세요. 최소 5개(5~6개 권장) · 가장 두드러진 것만.
        언제든 다시 이 링크로 들어와 수정할 수 있어요.
      </p>
      <AdjectiveGrid selected={selected} onToggle={toggle} accentClass="border-hidden bg-hidden text-white" />
      {error && <p className="text-sm text-[#B4502E] mt-3">{error}</p>}
      <div className="sticky bottom-0 mt-6 bg-paper/95 backdrop-blur py-3 border-t border-line flex items-center justify-between">
        <span className="text-sm text-sub">{selected.length}개 선택됨</span>
        <button className={btnCls} onClick={save} disabled={saving}>
          {saving ? "저장하는 중…" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
