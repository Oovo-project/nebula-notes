import type { HomeStatus } from "@/lib/types";

function formatTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function StatusPill({ status, seconds }: { status: HomeStatus; seconds: number }) {
  const label =
    status === "recording"
      ? `録音中... ${formatTime(seconds)}`
      : status === "uploading"
        ? "アップロード中..."
        : status === "processing"
          ? "解析中..."
          : status === "error"
            ? "エラー"
            : "待機中... 00:00";

  return (
    <div
      className="inline-flex h-7 items-center gap-2 rounded-[9999px] border border-[var(--line-accent)] bg-[var(--surface-pill)] px-3"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "recording" ? "bg-[#ef4444]" : status === "error" ? "bg-[#f59e0b]" : "bg-[#6b7280]"
        }`}
      />
      <span className="text-[12px] font-medium tracking-[0.01em] text-[var(--text-accent)]">{label}</span>
    </div>
  );
}
