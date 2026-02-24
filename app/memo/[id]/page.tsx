import { notFound } from "next/navigation";
import MemoDetailClient from "@/components/MemoDetailClient";
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
      <MemoDetailClient initialMemo={memo} />
    </main>
  );
}
