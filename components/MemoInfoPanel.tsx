import type { Memo } from "@/lib/types";

export default function MemoInfoPanel({ memo }: { memo: Memo }) {
  return (
    <aside className="w-[280px] space-y-2 max-[980px]:w-full">
      <div className="rounded-[12px] border border-[var(--line-soft)] bg-white/5 p-5">
        <h2 className="mb-5 text-[11px] font-medium tracking-[0.02em] text-[var(--text-muted)]">メモ情報</h2>
        <div className="space-y-4 text-[12px]">
          <Row label="カテゴリ" value={memo.category} />
          <Row label="録音時間" value={memo.recordingDuration} />
          <Row label="ピン留め" value={memo.pinned ? "あり" : "なし"} muted={!memo.pinned} />
          <div className="flex items-start justify-between">
            <span className="text-[var(--text-dim)]">タグ</span>
            <div className="flex gap-2">
              {memo.tags.map((tag) => (
                <span key={tag} className="rounded-[6px] border border-white/10 px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button type="button" className="h-10 w-full rounded-[10px] border border-[var(--line-soft)] bg-white/5 text-[13px] font-medium text-[var(--text-main)]">
          編集
        </button>
        <button type="button" className="h-10 w-full rounded-[10px] border border-[var(--line-soft)] bg-white/5 text-[13px] font-medium text-[var(--text-main)]">
          共有
        </button>
        <button type="button" className="h-10 w-full rounded-[10px] text-[13px] font-medium text-[#ef444466]">
          削除
        </button>
      </div>
    </aside>
  );
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-dim)]">{label}</span>
      <span className={`font-medium ${muted ? "text-[var(--text-dim)]" : "text-[var(--text-main)]"}`}>{value}</span>
    </div>
  );
}
