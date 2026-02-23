import type { MemoCategory } from "@/lib/types";

type SummaryResult = {
  title: string;
  summary: string;
};

export type MemoAnalysis = SummaryResult & {
  category: MemoCategory;
  tags: string[];
  summaryPoints: string[];
};

const CATEGORY_RULES: Array<{ category: MemoCategory; keywords: string[] }> = [
  { category: "アイデア", keywords: ["アイデア", "案", "企画", "改善", "提案", "コンセプト", "設計"] },
  { category: "やること", keywords: ["TODO", "タスク", "対応", "実装", "修正", "締切", "期限"] },
  { category: "調べもの", keywords: ["調査", "比較", "検証", "リサーチ", "調べ", "確認"] },
  { category: "買い物・ごはん", keywords: ["買い物", "食材", "ごはん", "料理", "レシピ", "夕食", "昼食"] },
  { category: "学び", keywords: ["学び", "勉強", "読書", "学習", "気づき", "理解", "知見"] },
  { category: "約束・連絡", keywords: ["連絡", "約束", "会議", "ミーティング", "返信", "日程", "打ち合わせ"] },
  { category: "お金", keywords: ["お金", "費用", "予算", "支払い", "請求", "コスト", "売上"] },
  { category: "メモ", keywords: ["メモ", "記録", "備忘", "その他"] },
];

const STOP_WORDS = new Set(["する", "した", "です", "ます", "これ", "それ", "ため", "こと", "よう", "ので"]);

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+|[一-龠々〆〤ぁ-んァ-ヴー]{2,}/giu) ?? [];
  return matches.filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function trimText(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function toSummaryPoints(text: string): string[] {
  const sentences = text
    .split(/[。！？!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 8);

  if (sentences.length === 0) {
    return [trimText(text, 56) || "要約候補を抽出できませんでした"];
  }

  return sentences.slice(0, 3).map((sentence) => trimText(sentence, 56));
}

function detectCategory(text: string): MemoCategory {
  const lower = text.toLowerCase();
  let winner: MemoCategory = "メモ";
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword.toLowerCase())) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      winner = rule.category;
    }
  }

  return winner;
}

function extractTags(text: string, category: MemoCategory): string[] {
  const tokens = tokenize(text);
  const countByToken = new Map<string, number>();

  tokens.forEach((token) => {
    countByToken.set(token, (countByToken.get(token) ?? 0) + 1);
  });

  const top = Array.from(countByToken.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .filter((token) => token !== category.toLowerCase())
    .slice(0, 3);

  return top.length > 0 ? top : [category, "音声メモ"];
}

function fallbackAnalysis(transcript: string): MemoAnalysis {
  const normalized = transcript.trim() || "音声からテキストを取得しました";
  const category = detectCategory(normalized);

  return {
    title: trimText(normalized, 24),
    summary: trimText(normalized, 110),
    category,
    tags: extractTags(normalized, category),
    summaryPoints: toSummaryPoints(normalized),
  };
}

export async function transcribeAudio(file: File): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return `(stub) ${file.name} を文字起こししました。`;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "gpt-4o-mini-transcribe");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) throw new Error("transcription api failed");
    const json = (await response.json()) as { text?: string };
    return json.text?.trim() || `(stub) ${file.name} を文字起こししました。`;
  } catch {
    return `(stub) ${file.name} を文字起こししました。`;
  }
}

async function summarizeTranscript(transcript: string): Promise<SummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const base = fallbackAnalysis(transcript);
    return { title: base.title, summary: base.summary };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You generate concise Japanese memo summaries. Return JSON with title and summary only.",
          },
          {
            role: "user",
            content: `以下を要約してください。JSON形式で title と summary を返してください。\n${transcript}`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("summary api failed");
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty summary response");

    const parsed = JSON.parse(content) as SummaryResult;
    return {
      title: parsed.title?.trim() || trimText(transcript, 24),
      summary: parsed.summary?.trim() || trimText(transcript, 110),
    };
  } catch {
    const base = fallbackAnalysis(transcript);
    return { title: base.title, summary: base.summary };
  }
}

export async function analyzeTranscript(transcript: string): Promise<MemoAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackAnalysis(transcript);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Classify Japanese memo text and return strict JSON: {title, summary, category, tags, summaryPoints}. category must be one of: アイデア, やること, 調べもの, 買い物・ごはん, 学び, 約束・連絡, お金, メモ. tags must be 2-4 short strings. summaryPoints must be 2-3 short bullet strings.",
          },
          {
            role: "user",
            content: `次の音声文字起こしを要約しカテゴリ分けしてください。\n${transcript}`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("analysis api failed");
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty analysis response");

    const parsed = JSON.parse(content) as Partial<MemoAnalysis>;
    const fallback = fallbackAnalysis(transcript);

    return {
      title: parsed.title?.trim() || fallback.title,
      summary: parsed.summary?.trim() || fallback.summary,
      category: (parsed.category as MemoCategory) || fallback.category,
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags.slice(0, 4) : fallback.tags,
      summaryPoints:
        Array.isArray(parsed.summaryPoints) && parsed.summaryPoints.length > 0
          ? parsed.summaryPoints.slice(0, 3)
          : fallback.summaryPoints,
    };
  } catch {
    const summary = await summarizeTranscript(transcript);
    const fallback = fallbackAnalysis(transcript);
    return {
      ...fallback,
      title: summary.title || fallback.title,
      summary: summary.summary || fallback.summary,
    };
  }
}

export async function summarizeText(transcript: string): Promise<SummaryResult> {
  const analysis = await analyzeTranscript(transcript);
  return {
    title: analysis.title,
    summary: analysis.summary,
  };
}
