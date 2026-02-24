import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { ensureMemoTable } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function resolveUploadPath(audioPath: string | null): string | null {
  if (!audioPath || !audioPath.startsWith("/uploads/")) return null;
  const relative = audioPath.replace(/^\/+/, "");
  return join(process.cwd(), "public", relative);
}

export async function DELETE(request: Request) {
  try {
    await ensureMemoTable();

    const pathname = new URL(request.url).pathname;
    const parts = pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const existing = await prisma.memo.findUnique({
      where: { id },
      select: { id: true, audioPath: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    await prisma.memo.delete({ where: { id } });

    const uploadPath = resolveUploadPath(existing.audioPath ?? null);
    if (uploadPath) {
      await unlink(uploadPath).catch(() => undefined);
    }

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}

type PatchBody = {
  title?: string;
  summary?: string;
  transcript?: string;
};

export async function PATCH(request: Request) {
  try {
    await ensureMemoTable();
    const pathname = new URL(request.url).pathname;
    const parts = pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const payload = (await request.json()) as PatchBody;
    const title = payload.title?.trim();
    const summary = payload.summary?.trim();
    const transcript = payload.transcript?.trim();

    if (!title && !summary && !transcript) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    }

    const updated = await prisma.memo.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(summary ? { summary } : {}),
        ...(transcript ? { transcript } : {}),
      },
      select: {
        id: true,
        title: true,
        summary: true,
        transcript: true,
      },
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}
