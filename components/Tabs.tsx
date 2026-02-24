export default function Tabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: string[];
  active: string;
  onSelect?: (tab: string) => void;
}) {
  return (
    <div className="w-full">
      <div className="flex h-9 items-center gap-2">
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelect?.(tab)}
              className={`inline-flex h-9 items-center px-5 text-[13px] transition ${
                isActive ? "border-b-2 border-[var(--text-accent)] text-[var(--text-accent)]" : "text-[var(--text-dim)] hover:text-[var(--text-muted)]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <div className="h-px w-full bg-white/8" />
    </div>
  );
}
