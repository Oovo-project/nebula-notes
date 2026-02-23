import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureMemoTable() {
  if (initialized) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Memo" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "summary" TEXT NOT NULL,
      "transcript" TEXT,
      "audioPath" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  initialized = true;
}
