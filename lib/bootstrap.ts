import { prisma } from "@/lib/prisma";

let initialized = false;

type TableInfoRow = {
  name: string;
};

async function ensureColumnExists(columnName: string, ddl: string) {
  const columns = await prisma.$queryRawUnsafe<TableInfoRow[]>(`PRAGMA table_info("Memo");`);
  const exists = columns.some((column) => column.name === columnName);
  if (exists) return;
  await prisma.$executeRawUnsafe(`ALTER TABLE "Memo" ADD COLUMN ${ddl};`);
}

export async function ensureMemoTable() {
  if (initialized) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Memo" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "summary" TEXT NOT NULL,
      "transcript" TEXT,
      "audioPath" TEXT,
      "category" TEXT NOT NULL DEFAULT 'メモ',
      "tags" TEXT,
      "summaryPoints" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await ensureColumnExists("category", `"category" TEXT NOT NULL DEFAULT 'メモ'`);
  await ensureColumnExists("tags", `"tags" TEXT`);
  await ensureColumnExists("summaryPoints", `"summaryPoints" TEXT`);

  initialized = true;
}
