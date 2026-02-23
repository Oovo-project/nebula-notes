type SummaryResult = {
  title: string;
  summary: string;
};

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

export async function summarizeText(transcript: string): Promise<SummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      title: transcript.length > 16 ? `${transcript.slice(0, 16)}...` : transcript,
      summary: "録音内容の要点を抽出したサマリー（stub）です。",
    };
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
        messages: [
          {
            role: "system",
            content: "あなたは音声メモを1行タイトルと2文以内の要約に変換するアシスタントです。",
          },
          {
            role: "user",
            content: `次の文字起こしをJSONで返してください。キーは title, summary。\n${transcript}`,
          },
        ],
        response_format: { type: "json_object" },
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
      title: parsed.title || "新規メモ",
      summary: parsed.summary || "要約が生成できませんでした。",
    };
  } catch {
    return {
      title: transcript.length > 16 ? `${transcript.slice(0, 16)}...` : transcript,
      summary: "録音内容の要点を抽出したサマリー（stub）です。",
    };
  }
}
