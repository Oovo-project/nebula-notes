import type { Memo } from "@/lib/types";

function chipStyles(category: Memo["category"]) {
  if (category === "アイデア") return "border-[#3b82f64d] bg-[#3b82f633] text-[#93c5fd]";
  if (category === "ミーティング") return "border-[#a855f74d] bg-[#a855f733] text-[#d8b4fe]";
  if (category === "日記") return "border-[#22c55e4d] bg-[#22c55e33] text-[#86efac]";
  return "border-white/10 bg-white/5 text-[var(--text-muted)]";
}

function timeLabel(memo: Memo): string {
  if (memo.createdAt) {
    const date = new Date(memo.createdAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    }
  }
  return memo.createdAtLabel;
}

export default function TodayMemoList({
  memos,
  selectedMemoId,
  onSelectMemo,
}: {
  memos: Memo[];
  selectedMemoId: string;
  onSelectMemo: (memoId: string) => void;
}) {
  return (
    <section className="border-t border-[var(--line-soft)] bg-[#060a12]">
      <div className="px-6 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-medium tracking-[0.02em] text-[var(--text-main)]">今日の記録メモ</h3>
          <span className="text-[11px] text-[var(--text-dim)]">{memos.length} 件</span>
        </div>

        {memos.length === 0 ? (
          <p className="text-[12px] text-[var(--text-dim)]">今日はまだ記録がありません。</p>
        ) : (
          <div className="grid gap-2">
            {memos.map((memo) => {
              const selected = memo.id === selectedMemoId;
              return (
                <button
                  key={memo.id}
                  type="button"
                  onClick={() => onSelectMemo(memo.id)}
                  className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[12px] border px-3 py-2 text-left transition ${
                    selected
                      ? "border-[#8ab4f866] bg-[#8ab4f814]"
                      : "border-white/10 bg-[#0a0f18] hover:border-[#8ab4f83a] hover:bg-[#0f1624]"
                  }`}
                >
                  <span className={`inline-flex h-6 items-center rounded-[9999px] border px-2 text-[11px] ${chipStyles(memo.category)}`}>
                    {memo.category}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[var(--text-main)]">{memo.title}</p>
                    <p className="truncate text-[11px] text-[var(--text-dim)]">{memo.summary}</p>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">{timeLabel(memo)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
