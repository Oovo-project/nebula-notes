"use client";

type ChipValue = string;

export default function FilterChips({
  items,
  active,
  size = "md",
  onSelect,
}: {
  items: ChipValue[];
  active: ChipValue;
  size?: "sm" | "md";
  onSelect: (value: ChipValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = item === active;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`rounded-[9999px] border transition ${
              size === "sm" ? "h-6 px-[8px] text-[12px]" : "h-7 px-[14px] text-[12px]"
            } ${
              isActive
                ? "border-[var(--line-accent)] bg-[var(--surface-pill)] text-[var(--text-accent)]"
                : "border-transparent text-[var(--text-dim)] hover:border-white/10"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
