import type { Memo, MemoCategory, SummaryA } from "@/lib/types";

type SourceMemo = {
  id: string;
  title: string;
  summary: string;
  category?: string | null;
  tags?: string[] | string | null;
  summaryPoints?: string[] | string | null;
  transcript?: string | null;
  createdAt: string | Date;
};

const CATEGORIES: MemoCategory[] = [
  "アイデア",
  "やること",
  "調べもの",
  "買い物・ごはん",
  "学び",
  "約束・連絡",
  "お金",
  "メモ",
];

function asCategory(input: string | null | undefined): MemoCategory {
  if (!input) return "メモ";
  return CATEGORIES.includes(input as MemoCategory) ? (input as MemoCategory) : "メモ";
}

function asDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

function createdAtLabel(input: string | Date): string {
  const date = asDate(input);
  if (Number.isNaN(date.getTime())) return "--:--";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "昨日";

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function normalizeTags(input: SourceMemo["tags"], category: MemoCategory): string[] {
  if (!input) return [category, "音声メモ"];

  const tokens =
    Array.isArray(input)
      ? input
      : input
          .split(",")
          .map((token) => token.trim())
          .filter(Boolean);

  return tokens.length > 0 ? tokens.slice(0, 4) : [category, "音声メモ"];
}

function buildSummaryPoints(input: SourceMemo["summaryPoints"], summary: string): string[] {
  if (Array.isArray(input) && input.length > 0) {
    return input.slice(0, 4);
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.length > 0) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 4).map((value) => String(value));
        }
      } catch {
        // continue to sentence split
      }
      return [trimmed.slice(0, 56)];
    }
  }

  const sentences = summary
    .split(/[。！？!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 8)
    .slice(0, 3);

  return sentences.length > 0 ? sentences : [summary.slice(0, 56)];
}

function toSummaryA(points: string[]): SummaryA[] {
  return points.map((text, index) => ({ id: `s-${index + 1}`, text }));
}

function formatDateTime(input: string | Date): string {
  const date = asDate(input);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toUiMemo(source: SourceMemo): Memo {
  const category = asCategory(source.category ?? undefined);
  const tags = normalizeTags(source.tags, category);
  const points = buildSummaryPoints(source.summaryPoints, source.summary);
  const parsedDate = asDate(source.createdAt);
  const iso = Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();

  return {
    id: source.id,
    category,
    title: source.title,
    summary: source.summary,
    createdAt: iso,
    summaryA: toSummaryA(points),
    createdAtLabel: createdAtLabel(source.createdAt),
    pinned: false,
    keyFacts: [
      { id: "f-1", icon: "calendar", value: formatDateTime(source.createdAt) },
      { id: "f-2", icon: "reference", value: tags.slice(0, 2).join(" / ") },
    ],
    openLoops: ["未確定・要確認はありません"],
    recordingDuration: "--:--",
    tags,
    expanded: source.summary,
    transcript: source.transcript ?? source.summary,
  };
}

export type ApiMemoItem = {
  id: string;
  title: string;
  summary: string;
  category?: string;
  tags?: string[];
  summaryPoints?: string[];
  transcript?: string;
  createdAt: string;
};
