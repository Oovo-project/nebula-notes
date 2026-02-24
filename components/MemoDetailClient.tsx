"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import KeyFacts from "@/components/KeyFacts";
import MemoInfoPanel from "@/components/MemoInfoPanel";
import OpenLoops from "@/components/OpenLoops";
import Tabs from "@/components/Tabs";
import type { Memo } from "@/lib/types";

type MemoTab = "要約" | "展開" | "原文";

function summaryPointsFromText(text: string): Memo["summaryA"] {
  const sentences = text
    .split(/[。！？!?\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 8)
    .slice(0, 3);

  if (sentences.length === 0) return [{ id: "s-1", text: text.slice(0, 64) }];
  return sentences.map((sentence, index) => ({ id: `s-${index + 1}`, text: sentence }));
}

export default function MemoDetailClient({ initialMemo }: { initialMemo: Memo }) {
  const router = useRouter();
  const [memo, setMemo] = useState<Memo>(initialMemo);
  const [activeTab, setActiveTab] = useState<MemoTab>("要約");
  const [shareLabel, setShareLabel] = useState("共有");
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const bodyContent = useMemo(() => {
    if (activeTab === "原文") return memo.transcript || "原文がありません。";
    if (activeTab === "展開") return memo.expanded || memo.summary;
    return "";
  }, [activeTab, memo.expanded, memo.summary, memo.transcript]);

  const handleEdit = async () => {
    const nextTitle = window.prompt("タイトルを編集", memo.title);
    if (nextTitle === null) return;
    const trimmedTitle = nextTitle.trim();
    if (trimmedTitle.length === 0) return;

    const nextSummary = window.prompt("要約を編集", memo.summary);
    if (nextSummary === null) return;
    const trimmedSummary = nextSummary.trim();
    if (trimmedSummary.length === 0) return;

    const response = await fetch(`/api/memos/${memo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmedTitle, summary: trimmedSummary }),
    });

    if (!response.ok) {
      setStatusMessage("編集の保存に失敗しました。");
      return;
    }

    setMemo((prev) => ({
      ...prev,
      title: trimmedTitle,
      summary: trimmedSummary,
      expanded: trimmedSummary,
      summaryA: summaryPointsFromText(trimmedSummary),
    }));
    setStatusMessage("編集内容を保存しました。");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel("コピー済み");
      setTimeout(() => setShareLabel("共有"), 1200);
    } catch {
      setStatusMessage("共有リンクのコピーに失敗しました。");
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    const ok = window.confirm("このメモを削除しますか？");
    if (!ok) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/memos/${memo.id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        setStatusMessage("削除に失敗しました。");
        setDeleting(false);
        return;
      }
      router.push("/inbox");
      router.refresh();
    } catch {
      setStatusMessage("削除に失敗しました。");
      setDeleting(false);
    }
  };

  return (
    <section className="mx-auto flex h-full w-full max-w-[1280px] gap-12 px-12 pb-12 pt-24 max-[980px]:flex-col max-[980px]:px-6 max-[980px]:pt-10">
      <div className="flex h-full flex-1 flex-col gap-8">
        <div>
          <a href="/inbox" className="inline-flex items-center gap-1 text-[12px] text-[var(--text-dim)]">
            ← 受信トレイに戻る
          </a>

          <div className="mt-5 flex items-center gap-3 text-[12px] text-[var(--text-dim)]">
            <span className="inline-flex h-6 items-center rounded-[8px] border border-[#3b82f64d] bg-[#3b82f633] px-[10px] text-[11px] font-medium text-[#93c5fd]">
              {memo.category}
            </span>
            <span>{memo.createdAtLabel}</span>
            <span>📌</span>
          </div>

          <h1 className="mt-4 text-[28px] font-bold text-white">{memo.title}</h1>
        </div>

        <Tabs
          tabs={["要約", "展開", "原文"]}
          active={activeTab}
          onSelect={(tab) => setActiveTab(tab as MemoTab)}
        />

        {activeTab === "要約" ? (
          <section className="space-y-4 border-b border-[var(--line-soft)] pb-8">
            <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--text-muted)]">要 点</p>
            {memo.summaryA.map((item) => (
              <p key={item.id} className="flex items-start gap-2 text-[14px] leading-relaxed text-[var(--text-main)]">
                <span className="text-[var(--text-accent)]">•</span>
                <span>{item.text}</span>
              </p>
            ))}
          </section>
        ) : (
          <section className="space-y-4 border-b border-[var(--line-soft)] pb-8">
            <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--text-muted)]">{activeTab}</p>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--text-main)]">{bodyContent}</p>
          </section>
        )}

        <KeyFacts facts={memo.keyFacts} />
        <OpenLoops items={memo.openLoops} />

        {statusMessage ? <p className="text-[12px] text-[var(--text-dim)]">{statusMessage}</p> : null}
      </div>

      <MemoInfoPanel
        memo={memo}
        onEdit={handleEdit}
        onShare={handleShare}
        onDelete={handleDelete}
        shareLabel={shareLabel}
        deleting={deleting}
      />
    </section>
  );
}
