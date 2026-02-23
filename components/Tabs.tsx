export default function Tabs({ tabs, active }: { tabs: string[]; active: string }) {
  return (
    <div className="w-full">
      <div className="flex h-9 items-center gap-2">
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              className={`inline-flex h-9 items-center px-5 text-[13px] ${
                isActive ? "border-b-2 border-[var(--text-accent)] text-[var(--text-accent)]" : "text-[var(--text-dim)]"
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
