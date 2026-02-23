import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { analyzeTranscript, transcribeAudio } from "@/lib/ai";
import { ensureMemoTable } from "@/lib/bootstrap";

export const runtime = "nodejs";

const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
]);

function pickExtension(file: File): string {
  const byName = extname(file.name || "");
  if (byName) return byName;
  if (file.type.includes("webm")) return ".webm";
  if (file.type.includes("mp4")) return ".mp4";
  if (file.type.includes("mpeg")) return ".mp3";
  if (file.type.includes("wav")) return ".wav";
  if (file.type.includes("ogg")) return ".ogg";
  return ".webm";
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

function parseSummaryPoints(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
  } catch {
    return [raw];
  }
  return [];
}

export async function GET(request: Request) {
  try {
    await ensureMemoTable();
    const { searchParams } = new URL(request.url);
    const rawLimit = Number(searchParams.get("limit") ?? "3");
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 3;

    const rows = await prisma.memo.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
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

    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        category: row.category,
        tags: parseTags(row.tags),
        summaryPoints: parseSummaryPoints(row.summaryPoints),
        transcript: row.transcript ?? "",
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureMemoTable();
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "audio is required" }, { status: 400 });
    }

    if (!SUPPORTED_AUDIO_TYPES.has(audio.type)) {
      return NextResponse.json({ error: "unsupported audio format" }, { status: 415 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${randomUUID()}${pickExtension(audio)}`;
    const filepath = join(uploadDir, filename);
    const buffer = Buffer.from(await audio.arrayBuffer());
    await writeFile(filepath, buffer);

    const transcript = await transcribeAudio(audio);
    const analyzed = await analyzeTranscript(transcript);

    const created = await prisma.memo.create({
      data: {
        title: analyzed.title,
        summary: analyzed.summary,
        transcript,
        audioPath: `/uploads/${filename}`,
        category: analyzed.category,
        tags: analyzed.tags.join(","),
        summaryPoints: JSON.stringify(analyzed.summaryPoints),
      },
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

    return NextResponse.json(
      {
        item: {
          id: created.id,
          title: created.title,
          summary: created.summary,
          category: created.category,
          tags: parseTags(created.tags),
          summaryPoints: parseSummaryPoints(created.summaryPoints),
          transcript: created.transcript ?? "",
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
