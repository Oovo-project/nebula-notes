"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MicButton from "@/components/MicButton";
import OrbBackground from "@/components/OrbBackground";
import RecentMemos from "@/components/RecentMemos";
import { useRecordingUi } from "@/components/RecordingProvider";
import type { MemoCategory, RecentMemo } from "@/lib/types";

type MemosResponse = {
  items: Array<{
    id: string;
    title: string;
    summary: string;
    category?: MemoCategory;
    createdAt: string;
  }>;
};

function ListeningBars({ active }: { active: boolean }) {
  const heights = [16, 28, 40, 30, 46, 25, 34, 18, 13];
  return (
    <div className="flex h-12 items-center justify-center gap-[5px]" aria-hidden>
      {heights.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={`w-[4px] rounded-[2px] bg-[#8ab4f8] ${active ? "animate-[pulseBar_1.2s_ease-in-out_infinite]" : "opacity-70"}`}
          style={{ height, animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function ProcessingState({ status }: { status: "uploading" | "processing" }) {
  return (
    <div className="mt-4 w-[360px] rounded-[12px] border border-[var(--line-soft)] bg-white/[0.03] px-4 py-3">
      <p className="text-[12px] text-[var(--text-muted)]">{status === "uploading" ? "アップロード中..." : "解析中..."}</p>
      <div className="mt-3 space-y-2">
        <div className="h-2 w-full animate-pulse rounded bg-white/10" />
        <div className="h-2 w-4/5 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

function normalizeCategory(category?: MemoCategory): MemoCategory {
  return category ?? "メモ";
}

export default function HomePage() {
  const { status, errorMessage, refreshKey, recordingSupported, startRecording, stopRecording } = useRecordingUi();
  const [recentMemos, setRecentMemos] = useState<RecentMemo[]>([]);

  const fetchRecentMemos = useCallback(async () => {
    const response = await fetch("/api/memos?limit=3", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("メモ一覧の取得に失敗しました");
    }
    const payload = (await response.json()) as MemosResponse;
    const items: RecentMemo[] = payload.items.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: normalizeCategory(item.category),
      createdAt: item.createdAt,
    }));
    setRecentMemos(items);
  }, []);

  useEffect(() => {
    fetchRecentMemos().catch(() => {
      setRecentMemos([]);
    });
  }, [fetchRecentMemos, refreshKey]);

  const helperText = useMemo(() => {
    if (!recordingSupported) return "このブラウザは録音非対応です";
    if (status === "recording") return "録音中 - 思考を自由に展開してください";
    if (status === "uploading") return "音声データをアップロードしています";
    if (status === "processing") return "文字起こし・要約・カテゴリ判定を実行しています";
    if (status === "error") return errorMessage || "処理に失敗しました";
    return "録音ボタンを押して新しいメモを開始";
  }, [errorMessage, recordingSupported, status]);

  const onMicClick = async () => {
    if (status === "recording") {
      stopRecording();
      return;
    }
    if (status === "idle" || status === "error") {
      await startRecording();
    }
  };

  const recording = status === "recording";

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center px-12 pt-3">
        <div className="relative mt-4 w-[min(55vw,720px)] max-w-[720px] max-[980px]:w-[min(92vw,560px)]">
          <div className="relative aspect-square">
            <OrbBackground isRecording={recording} />
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[57%]">
              <MicButton active={recording} busy={status === "uploading" || status === "processing"} onClick={() => void onMicClick()} />
            </div>
            <div className="absolute left-1/2 top-[69%] z-10 -translate-x-1/2">
              <ListeningBars active={recording} />
              <p className="mt-1 text-center text-[16px] font-medium text-[var(--text-accent)]">Listening...</p>
            </div>
          </div>
        </div>

        {(status === "uploading" || status === "processing") && <ProcessingState status={status} />}

        <p className={`mt-3 text-[12px] font-medium ${status === "error" ? "text-[#ef4444]" : "text-[var(--text-dim)]"}`}>{helperText}</p>
      </section>

      <RecentMemos memos={recentMemos} />

      <footer className="pb-8 text-center text-[12px] font-medium text-[var(--text-dim)]">録音中 - 思考を自由に展開してください</footer>

      <style jsx>{`
        @keyframes pulseBar {
          0%,
          100% {
            transform: scaleY(0.35);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </main>
  );
}
