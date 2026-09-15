"use client";
import { ADJECTIVES } from "@/lib/adjectives";

export default function AdjectiveGrid({
  selected,
  onToggle,
  accentClass = "border-accent bg-accent text-white",
}: {
  selected: string[];
  onToggle: (id: string) => void;
  accentClass?: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
      {ADJECTIVES.map((a) => {
        const on = selected.includes(a.id);
        return (
          <button
            key={a.id}
            onClick={() => onToggle(a.id)}
            className={
              "rounded-xl border px-3 py-2.5 text-sm text-left transition-colors " +
              (on ? accentClass : "border-line bg-white text-ink")
            }
          >
            {a.ko}
          </button>
        );
      })}
    </div>
  );
}
