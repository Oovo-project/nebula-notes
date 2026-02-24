import Link from "next/link";
import type { Memo } from "@/lib/types";

function chipStyles(category: Memo["category"]) {
  if (category === "アイデア") return "border-[#3b82f64d] bg-[#3b82f633] text-[#93c5fd]";
  if (category === "ミーティング") return "border-[#a855f74d] bg-[#a855f733] text-[#d8b4fe]";
  if (category === "日記") return "border-[#22c55e4d] bg-[#22c55e33] text-[#86efac]";
  return "border-white/10 bg-white/5 text-[var(--text-muted)]";
}

function FactIcon({ index }: { index: number }) {
  if (index === 0) {
    return <span className="text-[12px] text-[#8ab4f8]">◷</span>;
  }
  if (index === 1) {
    return <span className="text-[12px] text-[#8ab4f8]">⌘</span>;
  }
  return <span className="text-[12px] text-[#8ab4f8]">↗</span>;
}

export default function InboxPreviewPanel({
  memo,
  onDelete,
  deleting,
}: {
  memo: Memo | null;
  onDelete?: (memoId: string) => void;
  deleting?: boolean;
}) {
  if (!memo) {
    return (
      <aside className="h-full w-[400px] border-l border-[var(--line-soft)] bg-[var(--surface-panel)] max-[1024px]:w-full max-[1024px]:border-l-0 max-[1024px]:border-t">
        <div className="flex h-full items-center justify-center px-6">
          <p className="text-[12px] text-[var(--text-dim)]">録音メモを作成すると、ここにプレビューが表示されます。</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-[400px] border-l border-[var(--line-soft)] bg-[var(--surface-panel)] max-[1024px]:w-full max-[1024px]:border-l-0 max-[1024px]:border-t">
      <div className="flex flex-col gap-4 px-6 pb-6 pt-8">
        <h2 className="text-[11px] font-medium tracking-[0.02em] text-[var(--text-muted)]">選択中のメモ</h2>
        <span className={`inline-flex h-6 w-fit items-center rounded-[8px] border px-[10px] text-[11px] font-medium ${chipStyles(memo.category)}`}>
          {memo.category}
        </span>
        <h3 className="text-[20px] font-bold leading-tight text-white">{memo.title}</h3>
        <p className="text-[12px] text-[var(--text-dim)]">{memo.createdAtLabel}</p>
      </div>

      <div className="h-px w-full bg-[var(--line-soft)]" />

      <div className="flex flex-col gap-6 p-6">
        <div className="space-y-3">
          <p className="text-[11px] font-medium text-[var(--text-muted)]">要約</p>
          {memo.summaryA.slice(0, 3).map((point) => (
            <p key={point.id} className="flex items-start gap-2 text-[13px] text-[var(--text-main)]">
              <span className="text-[13px] text-[var(--text-accent)]">•</span>
              <span>{point.text}</span>
            </p>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-medium text-[var(--text-muted)]">重要抽出</p>
          <div className="space-y-2">
            {memo.keyFacts.map((fact, index) => (
              <p key={fact.id} className="flex items-center gap-2 text-[12px] font-medium text-[var(--text-accent)]">
                <FactIcon index={index} />
                <span>{fact.value}</span>
              </p>
            ))}
          </div>
        </div>

        <Link
          href={`/memo/${memo.id}`}
          className="inline-flex h-9 w-fit items-center rounded-[9999px] border border-[var(--line-accent)] bg-[var(--surface-pill)] px-5 text-[13px] font-medium text-[var(--text-accent)]"
        >
          詳細を開く →
        </Link>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(memo.id)}
            disabled={deleting}
            className="inline-flex h-9 w-fit items-center rounded-[9999px] border border-[#ef444466] bg-[#2a1218] px-5 text-[13px] font-medium text-[#fca5a5] transition hover:bg-[#3a1620] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "削除中..." : "この星メモを削除"}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
