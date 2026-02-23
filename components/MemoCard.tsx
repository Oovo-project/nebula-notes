import Link from "next/link";
import type { Memo } from "@/lib/types";

function chipStyles(category: Memo["category"]) {
  if (category === "アイデア") return "border-[#3b82f64d] bg-[#3b82f633] text-[#93c5fd]";
  if (category === "ミーティング") return "border-[#a855f74d] bg-[#a855f733] text-[#d8b4fe]";
  if (category === "日記") return "border-[#22c55e4d] bg-[#22c55e33] text-[#86efac]";
  return "border-white/10 bg-white/5 text-[var(--text-muted)]";
}

export default function MemoCard({ memo }: { memo: Memo }) {
  return (
    <Link
      href={`/memo/${memo.id}`}
      className="group flex min-h-[142px] flex-1 flex-col gap-3 rounded-[12px] border border-[var(--line-soft)] bg-[rgba(255,255,255,0.01)] px-5 py-4 transition hover:border-white/10"
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-6 items-center rounded-[8px] border px-[10px] text-[10px] font-medium ${chipStyles(memo.category)}`}>
          {memo.category}
        </span>
        <time className="text-[12px] text-[var(--text-dim)]">{memo.createdAtLabel}</time>
      </div>
      <h3 className="text-[24px] font-bold leading-tight tracking-[-0.01em] text-white">{memo.title}</h3>
      <p className="line-clamp-2 text-[12px] leading-relaxed text-[var(--text-muted)]">{memo.summary}</p>
    </Link>
  );
}
