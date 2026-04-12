import { promises as fs } from "fs";
import path from "path";
import type { AppDatabase } from "@/lib/db/types";
import { createSeedDatabase } from "@/lib/db/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "database.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readDatabase(): Promise<AppDatabase> {
  await ensureDir();
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as AppDatabase;
  } catch {
    const seed = createSeedDatabase();
    await writeDatabase(seed);
    return seed;
  }
}

export async function writeDatabase(db: AppDatabase): Promise<void> {
  await ensureDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function mutateDatabase<T>(
  fn: (draft: AppDatabase) => T,
): Promise<T> {
  const db = await readDatabase();
  const result = fn(db);
  await writeDatabase(db);
  return result;
}
