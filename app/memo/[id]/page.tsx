import Link from "next/link";
import { notFound } from "next/navigation";
import KeyFacts from "@/components/KeyFacts";
import MemoInfoPanel from "@/components/MemoInfoPanel";
import OpenLoops from "@/components/OpenLoops";
import Tabs from "@/components/Tabs";
import { ensureMemoTable } from "@/lib/bootstrap";
import { toUiMemo } from "@/lib/memo-normalizer";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MemoDetailPage({ params }: Props) {
  const { id } = await params;
  await ensureMemoTable();

  const row = await prisma.memo.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      summary: true,
      category: true,
      tags: true,
      summaryPoints: true,
      transcript: true,
      createdAt: true,
    },
  });

  if (!row) {
    notFound();
  }

  const memo = toUiMemo({
    ...row,
    tags: row.tags,
    summaryPoints: row.summaryPoints,
    transcript: row.transcript,
  });

  return (
    <main className="flex-1 bg-black">
      <section className="mx-auto flex h-full w-full max-w-[1280px] gap-12 px-12 pb-12 pt-24 max-[980px]:flex-col max-[980px]:px-6 max-[980px]:pt-10">
        <div className="flex h-full flex-1 flex-col gap-8">
          <div>
            <Link href="/inbox" className="inline-flex items-center gap-1 text-[12px] text-[var(--text-dim)]">
              ← 受信トレイに戻る
            </Link>

            <div className="mt-5 flex items-center gap-3 text-[12px] text-[var(--text-dim)]">
              <span className="inline-flex h-6 items-center rounded-[8px] border border-[#3b82f64d] bg-[#3b82f633] px-[10px] text-[11px] font-medium text-[#93c5fd]">
                {memo.category}
              </span>
              <span>{memo.createdAtLabel}</span>
              <span>📌</span>
            </div>

            <h1 className="mt-4 text-[28px] font-bold text-white">{memo.title}</h1>
          </div>

          <Tabs tabs={["要約", "展開", "原文"]} active="要約" />

          <section className="space-y-4 border-b border-[var(--line-soft)] pb-8">
            <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--text-muted)]">要 点</p>
            {memo.summaryA.map((item) => (
              <p key={item.id} className="flex items-start gap-2 text-[14px] leading-relaxed text-[var(--text-main)]">
                <span className="text-[var(--text-accent)]">•</span>
                <span>{item.text}</span>
              </p>
            ))}
          </section>

          <KeyFacts facts={memo.keyFacts} />

          <OpenLoops items={memo.openLoops} />
        </div>

        <MemoInfoPanel memo={memo} />
      </section>
    </main>
  );
}
