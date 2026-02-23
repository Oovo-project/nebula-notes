import type { KeyFact } from "@/lib/types";

function iconFor(type: KeyFact["icon"]) {
  if (type === "calendar") return "◷";
  if (type === "team") return "⌘";
  if (type === "reference") return "↗";
  return "•";
}

export default function KeyFacts({ facts }: { facts: KeyFact[] }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--text-muted)]">重要抽出</p>
      <div className="flex flex-wrap items-center gap-4">
        {facts.map((fact) => (
          <p key={fact.id} className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-accent)]">
            <span className="text-[12px]">{iconFor(fact.icon)}</span>
            <span>{fact.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
