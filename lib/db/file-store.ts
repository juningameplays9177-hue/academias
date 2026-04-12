/**
 * Armazenamento em disco **por unidade**:
 * - `data/platform.json` — academias (nome, slug, localização, contato, etc.) + usuários sem tenant (ultra admin).
 * - `data/tenants/{academiaId}.json` — dados daquela academia: admins operacionais, alunos, professores, planos,
 *   treinos, aulas (título/localização no sentido de agenda), avisos, frequência.
 * A API continua usando `readDatabase` / `mutateDatabase`, que montam o `AppDatabase` unificado em memória.
 * Se existir `data/database.json` legado, ele é migrado uma vez para o novo layout e renomeado para `.bak`.
 */
import { promises as fs } from "fs";
import path from "path";
import type {
  AppDatabase,
  PlatformRegistry,
  TenantDatabase,
} from "@/lib/db/types";
import { createSeedDatabase } from "@/lib/db/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const TENANTS_DIR = path.join(DATA_DIR, "tenants");
const PLATFORM_PATH = path.join(DATA_DIR, "platform.json");
/** Arquivo único legado (pré-split); migrado automaticamente na primeira leitura. */
const LEGACY_DB_PATH = path.join(DATA_DIR, "database.json");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(TENANTS_DIR, { recursive: true });
}

export function emptyTenantDatabase(): TenantDatabase {
  return {
    version: 1,
    users: [],
    students: [],
    plans: [],
    professors: [],
    workouts: [],
    classes: [],
    notices: [],
    attendance: [],
  };
}

function tenantFilePath(academiaId: string): string {
  const safe = academiaId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(TENANTS_DIR, `${safe}.json`);
}

function splitMergedToParts(merged: AppDatabase): {
  platform: PlatformRegistry;
  tenants: Map<string, TenantDatabase>;
} {
  const academiaIds = new Set(merged.academias.map((a) => a.id));
  const platformUsers = merged.users.filter((u) => u.academiaId === null);
  const orphans = merged.users.filter(
    (u) => u.academiaId != null && !academiaIds.has(u.academiaId),
  );

  const platform: PlatformRegistry = {
    version: merged.version,
    platformSettings: merged.platformSettings,
    academias: merged.academias,
    users: platformUsers,
    ...(orphans.length ? { orphanTenantUsers: orphans } : {}),
  };

  const tenants = new Map<string, TenantDatabase>();
  for (const a of merged.academias) {
    const id = a.id;
    tenants.set(id, {
      version: 1,
      users: merged.users.filter((u) => u.academiaId === id),
      students: merged.students.filter((s) => s.academiaId === id),
      plans: merged.plans.filter((p) => p.academiaId === id),
      professors: merged.professors.filter((p) => p.academiaId === id),
      workouts: merged.workouts.filter((w) => w.academiaId === id),
      classes: merged.classes.filter((c) => c.academiaId === id),
      notices: merged.notices.filter((n) => n.academiaId === id),
      attendance: merged.attendance.filter((x) => x.academiaId === id),
    });
  }

  return { platform, tenants };
}

async function loadPlatform(): Promise<PlatformRegistry> {
  const raw = await fs.readFile(PLATFORM_PATH, "utf-8");
  return JSON.parse(raw) as PlatformRegistry;
}

async function savePlatform(p: PlatformRegistry): Promise<void> {
  await fs.writeFile(PLATFORM_PATH, JSON.stringify(p, null, 2), "utf-8");
}

async function loadTenant(academiaId: string): Promise<TenantDatabase> {
  const fp = tenantFilePath(academiaId);
  try {
    const raw = await fs.readFile(fp, "utf-8");
    return JSON.parse(raw) as TenantDatabase;
  } catch {
    return emptyTenantDatabase();
  }
}

async function saveTenant(academiaId: string, t: TenantDatabase): Promise<void> {
  const fp = tenantFilePath(academiaId);
  await fs.writeFile(fp, JSON.stringify(t, null, 2), "utf-8");
}

async function mergeFromDisk(platform: PlatformRegistry): Promise<AppDatabase> {
  const orphan = platform.orphanTenantUsers ?? [];
  const tenantUsers: typeof platform.users = [];
  const students = [];
  const plans = [];
  const professors = [];
  const workouts = [];
  const classes = [];
  const notices = [];
  const attendance = [];

  for (const a of platform.academias) {
    const t = await loadTenant(a.id);
    tenantUsers.push(...t.users);
    students.push(...t.students);
    plans.push(...t.plans);
    professors.push(...t.professors);
    workouts.push(...t.workouts);
    classes.push(...t.classes);
    notices.push(...t.notices);
    attendance.push(...t.attendance);
  }

  return {
    version: platform.version,
    platformSettings: platform.platformSettings,
    academias: platform.academias,
    users: [...platform.users, ...orphan, ...tenantUsers],
    students,
    plans,
    professors,
    workouts,
    classes,
    notices,
    attendance,
  };
}

/** Grava `platform.json` + um JSON por academia e remove arquivos de unidades excluídas. */
export async function persistMergedDatabase(merged: AppDatabase): Promise<void> {
  await ensureDirs();
  const { platform, tenants } = splitMergedToParts(merged);
  await savePlatform(platform);

  for (const [id, t] of tenants) {
    await saveTenant(id, t);
  }

  let dirFiles: string[] = [];
  try {
    dirFiles = await fs.readdir(TENANTS_DIR);
  } catch {
    return;
  }
  for (const f of dirFiles) {
    if (!f.endsWith(".json")) continue;
    const fp = path.join(TENANTS_DIR, f);
    const stillUsed = platform.academias.some((a) => tenantFilePath(a.id) === fp);
    if (!stillUsed) await fs.unlink(fp).catch(() => {});
  }
}

async function migrateLegacyDatabaseIfPresent(): Promise<void> {
  let legacyExists = false;
  try {
    await fs.access(LEGACY_DB_PATH);
    legacyExists = true;
  } catch {
    return;
  }
  if (!legacyExists) return;

  let platformExists = false;
  try {
    await fs.access(PLATFORM_PATH);
    platformExists = true;
  } catch {
    /* ok */
  }
  if (platformExists) return;

  await ensureDirs();
  const raw = await fs.readFile(LEGACY_DB_PATH, "utf-8");
  const merged = JSON.parse(raw) as AppDatabase;
  await persistMergedDatabase(merged);
  const bak = `${LEGACY_DB_PATH}.migrated.${Date.now()}.bak`;
  await fs.rename(LEGACY_DB_PATH, bak);
}

export async function readDatabase(): Promise<AppDatabase> {
  await ensureDirs();
  await migrateLegacyDatabaseIfPresent();

  let platform: PlatformRegistry;
  try {
    platform = await loadPlatform();
  } catch {
    const seed = createSeedDatabase();
    await persistMergedDatabase(seed);
    return seed;
  }

  return mergeFromDisk(platform);
}

export async function writeDatabase(db: AppDatabase): Promise<void> {
  await persistMergedDatabase(db);
}

export async function mutateDatabase<T>(
  fn: (draft: AppDatabase) => T,
): Promise<T> {
  const db = await readDatabase();
  const result = fn(db);
  await persistMergedDatabase(db);
  return result;
}

/** Lê só o cadastro global (academias + ultra), sem carregar tenants. */
export async function readPlatformRegistry(): Promise<PlatformRegistry> {
  await ensureDirs();
  await migrateLegacyDatabaseIfPresent();
  try {
    return await loadPlatform();
  } catch {
    const seed = createSeedDatabase();
    await persistMergedDatabase(seed);
    return (await loadPlatform()) as PlatformRegistry;
  }
}
