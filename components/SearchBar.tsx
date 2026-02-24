"use client";

export default function SearchBar({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <label className="flex h-9 w-[220px] items-center gap-2 rounded-[9999px] border border-white/10 bg-white/5 px-[14px]">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="9" cy="9" r="6" stroke="#6b7280" strokeWidth="1.4" />
        <path d="M13.5 13.5 17 17" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        id="memo-search"
        name="memoSearch"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="メモを検索..."
        className="w-full bg-transparent text-[13px] text-[var(--text-muted)] outline-none placeholder:text-[var(--text-dim)]"
      />
    </label>
  );
}
