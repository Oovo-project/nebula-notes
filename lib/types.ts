export type HomeStatus = "idle" | "recording" | "uploading" | "processing" | "error";

export type MemoCategory =
  | "アイデア"
  | "ミーティング"
  | "日記"
  | "やること"
  | "調べもの"
  | "買い物・ごはん"
  | "学び"
  | "約束・連絡"
  | "お金"
  | "メモ";

export type PeriodFilter = "all" | "week" | "today";

export type KeyFactIcon = "calendar" | "team" | "reference" | "pin";

export interface SummaryA {
  id: string;
  text: string;
}

export interface KeyFact {
  id: string;
  icon: KeyFactIcon;
  value: string;
}

export interface Memo {
  id: string;
  category: MemoCategory;
  title: string;
  summary: string;
  summaryA: SummaryA[];
  createdAtLabel: string;
  pinned: boolean;
  keyFacts: KeyFact[];
  openLoops: string[];
  recordingDuration: string;
  tags: string[];
  expanded: string;
  transcript: string;
}

export interface SkyZone {
  id: string;
  category: MemoCategory;
  count: number;
  x: number;
  y: number;
  size: number;
}

export interface SkyStar {
  id: string;
  memoId: string;
  category: MemoCategory;
  x: number;
  y: number;
  size: number;
  active?: boolean;
}

export interface SkyLink {
  id: string;
  from: string;
  to: string;
}

export interface Sky {
  backgroundImage: string;
  periods: PeriodFilter[];
  categories: Array<"すべて" | MemoCategory>;
  zones: SkyZone[];
  stars: SkyStar[];
  links: SkyLink[];
}
