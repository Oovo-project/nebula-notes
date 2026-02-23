export default function OpenLoops({ items }: { items: string[] }) {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--text-muted)]">未確定・要確認</p>
      <div className="rounded-[12px] border border-[var(--line-soft)] bg-white/5 p-4">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-[13px] text-[var(--text-main)]/90">
            <span className="mt-[1px] text-[#f59e0b]">⚠</span>
            <span>{item}</span>
          </p>
        ))}
      </div>
    </section>
  );
}
