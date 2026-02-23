import type { Memo, Sky } from "@/lib/types";

export const mockRecentMemos: Memo[] = [
  {
    id: "next-ui-concept",
    category: "アイデア",
    title: "次世代UIコンセプト",
    summary: "音声入力中心のインターフェース設計案。ユーザーの認知負荷を下げるために...",
    createdAtLabel: "14:02",
    pinned: false,
    summaryA: [
      { id: "s1", text: "音声入力を主軸にしたUIで、視覚的ノイズを極限まで削減する設計案" },
      { id: "s2", text: "認知負荷の低減が最優先。ボタン数を3つ以下に抑えるルールを提案" },
      { id: "s3", text: "競合分析でWhisperとNotionの音声機能を参照。差別化ポイントは即時圧縮" },
      { id: "s4", text: "プロトタイプは来週金曜（11/1）までに完成。デザインチームでレビュー予定" },
    ],
    keyFacts: [
      { id: "k1", icon: "calendar", value: "11/1（金）" },
      { id: "k2", icon: "team", value: "デザインチーム" },
      { id: "k3", icon: "reference", value: "Whisper / Notion" },
    ],
    openLoops: ["「ボタン3つ以下」のルールが全画面に適用されるか未確認"],
    recordingDuration: "01:47",
    tags: ["UI", "設計"],
    expanded:
      "音声中心のUIを試作し、情報階層を最小化する案。ユーザーの操作回数を減らし、学習コストを抑える。次回は検証対象の画面を3つに絞り、視線移動と認知負荷を測定する。",
    transcript:
      "次世代UIの方向性として、入力を音声中心に寄せたい。画面要素は整理して、初見でも迷わない設計にする。来週金曜までにプロトタイプをまとめる。",
  },
  {
    id: "q4-regular-meeting",
    category: "ミーティング",
    title: "Q4 プロジェクト定例",
    summary: "来期の予算配分についての合意事項。開発チームのリソース調整が必要...",
    createdAtLabel: "昨日",
    pinned: true,
    summaryA: [
      { id: "s1", text: "開発とデザインの共通マイルストーンを設定" },
      { id: "s2", text: "バックログ上位10件を2週間で再見積もり" },
      { id: "s3", text: "レビュー会を毎週火曜15時に固定" },
    ],
    keyFacts: [
      { id: "k1", icon: "calendar", value: "毎週火曜 15:00" },
      { id: "k2", icon: "team", value: "開発チーム / PM" },
    ],
    openLoops: ["予算配分の最終承認待ち"],
    recordingDuration: "02:08",
    tags: ["定例", "予算"],
    expanded: "予算と体制の調整を中心に進行。優先機能の再定義が必要。",
    transcript: "Q4の定例会議。予算と進捗、採用計画を共有。",
  },
  {
    id: "autumn-walk-note",
    category: "日記",
    title: "秋の散歩道にて",
    summary: "冷たい風が心地よい。新しい小説のプロットがふと浮かんだ瞬間...",
    createdAtLabel: "10/24",
    pinned: false,
    summaryA: [
      { id: "s1", text: "街路樹の色が物語の導入イメージに一致" },
      { id: "s2", text: "主人公の動機を再構成する必要あり" },
      { id: "s3", text: "週末にプロット第一稿へ反映" },
    ],
    keyFacts: [{ id: "k1", icon: "calendar", value: "週末に執筆" }],
    openLoops: ["登場人物Bの背景設定が未整理"],
    recordingDuration: "00:56",
    tags: ["日記", "創作"],
    expanded: "散歩中に着想したプロット断片をメモ化。",
    transcript: "秋の空気で頭が整理され、物語の冒頭が見えた。",
  },
];

export const mockMemoDetail: Memo = mockRecentMemos[0];

export const mockSky: Sky = {
  backgroundImage: "/images/constellation-bg.png",
  periods: ["all", "week", "today"],
  categories: [
    "すべて",
    "アイデア",
    "やること",
    "調べもの",
    "買い物・ごはん",
    "学び",
    "約束・連絡",
    "お金",
    "メモ",
  ],
  zones: [
    { id: "z-idea", category: "アイデア", count: 5, x: 16, y: 22, size: 30 },
    { id: "z-todo", category: "やること", count: 4, x: 38, y: 36, size: 28 },
    { id: "z-learn", category: "学び", count: 3, x: 61, y: 18, size: 27 },
    { id: "z-memo", category: "メモ", count: 3, x: 30, y: 61, size: 29 },
    { id: "z-money", category: "お金", count: 2, x: 74, y: 54, size: 15 },
  ],
  stars: [
    { id: "st-1", memoId: "next-ui-concept", category: "アイデア", x: 18, y: 31, size: 8, active: true },
    { id: "st-2", memoId: "next-ui-concept", category: "アイデア", x: 22, y: 36, size: 6 },
    { id: "st-3", memoId: "next-ui-concept", category: "アイデア", x: 15, y: 40, size: 5 },
    { id: "st-4", memoId: "q4-regular-meeting", category: "やること", x: 50, y: 44, size: 7 },
    { id: "st-5", memoId: "q4-regular-meeting", category: "やること", x: 56, y: 49, size: 5 },
    { id: "st-6", memoId: "q4-regular-meeting", category: "やること", x: 46, y: 52, size: 6 },
    { id: "st-7", memoId: "autumn-walk-note", category: "学び", x: 74, y: 27, size: 8 },
    { id: "st-8", memoId: "autumn-walk-note", category: "学び", x: 78, y: 33, size: 6 },
    { id: "st-9", memoId: "autumn-walk-note", category: "メモ", x: 36, y: 70, size: 6 },
    { id: "st-10", memoId: "autumn-walk-note", category: "メモ", x: 41, y: 72, size: 5 },
  ],
  links: [
    { id: "ln-1", from: "st-1", to: "st-2" },
    { id: "ln-2", from: "st-2", to: "st-3" },
    { id: "ln-3", from: "st-2", to: "st-4" },
    { id: "ln-4", from: "st-4", to: "st-5" },
    { id: "ln-5", from: "st-4", to: "st-6" },
    { id: "ln-6", from: "st-4", to: "st-7" },
    { id: "ln-7", from: "st-7", to: "st-8" },
    { id: "ln-8", from: "st-6", to: "st-9" },
    { id: "ln-9", from: "st-9", to: "st-10" },
  ],
};

export async function getRecentMemos(): Promise<Memo[]> {
  return mockRecentMemos;
}

export async function getMemoById(id: string): Promise<Memo | null> {
  return mockRecentMemos.find((memo) => memo.id === id) ?? null;
}

export async function getSky(): Promise<Sky> {
  return mockSky;
}
