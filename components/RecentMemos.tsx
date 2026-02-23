import Link from "next/link";
import type { Memo } from "@/lib/types";
import MemoCard from "@/components/MemoCard";

export default function RecentMemos({ memos }: { memos: Memo[] }) {
  return (
    <section className="w-full px-8 pb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-[var(--text-muted)]">最近のメモ</h2>
        <Link href="/inbox" className="text-[12px] font-medium text-[var(--text-accent)]">
          すべて見る →
        </Link>
      </div>
      <div className="flex gap-4 max-[980px]:flex-col">
        {memos.slice(0, 3).map((memo) => (
          <MemoCard key={memo.id} memo={memo} />
        ))}
      </div>
    </section>
  );
}
