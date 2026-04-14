/**
 * Armazenamento em disco **por unidade**:
 * - `data/platform.json` — academias (nome, slug, localização, contato, etc.) + usuários sem tenant (ultra admin).
 * - `data/tenants/{id-sanitizado}/tenant.json` — **uma pasta por academia** com o JSON isolado: admins da unidade,
 *   alunos, professores, planos, treinos, aulas, avisos, frequência (não mistura com outras unidades).
 * A API continua usando `readDatabase` / `mutateDatabase`, que montam o `AppDatabase` unificado em memória.
 * Arquivos legados `data/tenants/{id}.json` na raiz são movidos automaticamente para a subpasta.
 * Se existir `data/database.json` legado, ele é migrado uma vez para o novo layout e renomeado para `.bak`.
 */
import { promises as fs } from "fs";
import path from "path";
import type {
  AppDatabase,
  PlanRecord,
  PlatformRegistry,
  PlatformRegistryProxyView,
  TenantDatabase,
} from "@/lib/db/types";
import { createSeedDatabase } from "@/lib/db/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const TENANTS_DIR = path.join(DATA_DIR, "tenants");
const PLATFORM_PATH = path.join(DATA_DIR, "platform.json");
/** Só flags + ids/slugs — usado pelo proxy para não parsear `platform.json` gigante (logos base64). */
const PROXY_PLATFORM_PATH = path.join(DATA_DIR, "proxy-platform.json");
/**
 * Cópia “quente” do registro (users + academias) com logos pesados removidos.
 * APIs como `/api/auth/me` e `/api/public/academias` leem isto — evita 503 por timeout no parse.
 */
const PLATFORM_PUBLIC_PATH = path.join(DATA_DIR, "platform-public.json");
/** Arquivo único legado (pré-split); migrado automaticamente na primeira leitura. */
const LEGACY_DB_PATH = path.join(DATA_DIR, "database.json");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(TENANTS_DIR, { recursive: true });
}

/** Nome da pasta da unidade em `data/tenants/` (derivado do id da academia). */
export function tenantSafeDirName(academiaId: string): string {
  return academiaId.replace(/[^a-zA-Z0-9_-]/g, "_");
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

/** JSON operacional da unidade (dentro da pasta exclusiva da academia). */
function tenantFilePath(academiaId: string): string {
  const safe = tenantSafeDirName(academiaId);
  return path.join(TENANTS_DIR, safe, "tenant.json");
}

/** Pasta dedicada à academia (somente esta unidade). */
export function tenantStoreDirRelativePath(academiaId: string): string {
  return `data/tenants/${tenantSafeDirName(academiaId)}/`;
}

/** Caminho relativo ao arquivo de dados da unidade (para logs / respostas de API). */
export function tenantStoreRelativePath(academiaId: string): string {
  return `${tenantStoreDirRelativePath(academiaId)}tenant.json`;
}

/** Migra `data/tenants/foo.json` → `data/tenants/foo/tenant.json` (uma pasta por academia). */
async function migrateFlatTenantJsonToSubfolders(): Promise<void> {
  await ensureDirs();
  let entries: string[];
  try {
    entries = await fs.readdir(TENANTS_DIR);
  } catch {
    return;
  }
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    const safe = name.slice(0, -".json".length);
    const flatPath = path.join(TENANTS_DIR, name);
    let isFile = false;
    try {
      const st = await fs.stat(flatPath);
      isFile = st.isFile();
    } catch {
      continue;
    }
    if (!isFile) continue;

    const dirPath = path.join(TENANTS_DIR, safe);
    const nestedPath = path.join(dirPath, "tenant.json");
    try {
      await fs.access(nestedPath);
      await fs.unlink(flatPath).catch(() => {});
      continue;
    } catch {
      /* nested não existe */
    }
    await fs.mkdir(dirPath, { recursive: true });
    await fs.rename(flatPath, nestedPath);
  }
}

/** Dados operacionais de uma única academia extraídos do banco unificado em memória. */
export function tenantDataSliceFromMerged(
  merged: AppDatabase,
  academiaId: string,
): TenantDatabase {
  return {
    version: 1,
    users: merged.users.filter((u) => u.academiaId === academiaId),
    students: merged.students.filter((s) => s.academiaId === academiaId),
    plans: merged.plans.filter((p) => p.academiaId === academiaId),
    professors: merged.professors.filter((p) => p.academiaId === academiaId),
    workouts: merged.workouts.filter((w) => w.academiaId === academiaId),
    classes: merged.classes.filter((c) => c.academiaId === academiaId),
    notices: merged.notices.filter((n) => n.academiaId === academiaId),
    attendance: merged.attendance.filter((x) => x.academiaId === academiaId),
  };
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
    tenants.set(a.id, tenantDataSliceFromMerged(merged, a.id));
  }

  return { platform, tenants };
}

/**
 * Garante que exista o arquivo JSON isolado da unidade após criação ou ajustes.
 * Não altera outras academias.
 */
export async function materializeTenantDatabaseFile(academiaId: string): Promise<void> {
  await ensureDirs();
  const merged = await readDatabase();
  if (!merged.academias.some((a) => a.id === academiaId)) return;
  const slice = tenantDataSliceFromMerged(merged, academiaId);
  await saveTenant(academiaId, slice);
}

async function loadPlatform(): Promise<PlatformRegistry> {
  const raw = await fs.readFile(PLATFORM_PATH, "utf-8");
  return JSON.parse(raw) as PlatformRegistry;
}

async function savePlatform(p: PlatformRegistry): Promise<void> {
  await fs.writeFile(PLATFORM_PATH, JSON.stringify(p, null, 2), "utf-8");
}

export function platformRegistryToProxyView(
  p: PlatformRegistry,
): PlatformRegistryProxyView {
  return {
    version: p.version,
    platformSettings: p.platformSettings,
    academias: p.academias.map((a) => ({
      id: a.id,
      slug: a.slug,
      status: a.status,
      plataformaDesligada: a.plataformaDesligada === true,
    })),
  };
}

async function saveProxyPlatformView(p: PlatformRegistry): Promise<void> {
  const lite = platformRegistryToProxyView(p);
  await fs.writeFile(
    PROXY_PLATFORM_PATH,
    JSON.stringify(lite, null, 2),
    "utf-8",
  );
}

function stripHeavyLogoForPublic(
  logoUrl: string | null | undefined,
): string | null {
  const u = (logoUrl ?? "").trim();
  if (!u) return null;
  if (u.startsWith("data:")) return null;
  if (u.length > 6000) return null;
  return u;
}

/** Mesmo conteúdo que `platform.json`, mas sem `data:`/URLs gigantes em `logoUrl` (parse rápido nas rotas públicas). */
export function platformRegistryToPublicServerCopy(
  p: PlatformRegistry,
): PlatformRegistry {
  return {
    ...p,
    academias: p.academias.map((a) => ({
      ...a,
      logoUrl: stripHeavyLogoForPublic(a.logoUrl),
    })),
  };
}

async function savePlatformPublicCopy(p: PlatformRegistry): Promise<void> {
  const pub = platformRegistryToPublicServerCopy(p);
  await fs.writeFile(
    PLATFORM_PUBLIC_PATH,
    JSON.stringify(pub, null, 2),
    "utf-8",
  );
}

async function loadTenant(academiaId: string): Promise<TenantDatabase> {
  const nested = tenantFilePath(academiaId);
  try {
    const raw = await fs.readFile(nested, "utf-8");
    return JSON.parse(raw) as TenantDatabase;
  } catch {
    const safe = tenantSafeDirName(academiaId);
    const legacyFlat = path.join(TENANTS_DIR, `${safe}.json`);
    try {
      const raw = await fs.readFile(legacyFlat, "utf-8");
      return JSON.parse(raw) as TenantDatabase;
    } catch {
      return emptyTenantDatabase();
    }
  }
}

/**
 * Planos de uma única unidade, sem `readDatabase` (evita ler e fundir todos os tenants — causa de 503/timeout em APIs públicas).
 */
export async function readTenantPlansForAcademia(academiaId: string): Promise<PlanRecord[]> {
  await ensureDirs();
  await migrateFlatTenantJsonToSubfolders();
  const t = await loadTenant(academiaId);
  return t.plans ?? [];
}

async function saveTenant(academiaId: string, t: TenantDatabase): Promise<void> {
  const fp = tenantFilePath(academiaId);
  await fs.mkdir(path.dirname(fp), { recursive: true });
  await fs.writeFile(fp, JSON.stringify(t, null, 2), "utf-8");
}

/**
 * Banco merged **apenas com os dados operacionais de uma academia** (um `tenant.json`).
 * Mantém `academias` e usuários globais da plataforma — suficiente para APIs escopadas por tenant.
 */
export async function readDatabaseScopeTenant(
  platform: PlatformRegistry,
  academiaId: string,
): Promise<AppDatabase> {
  const t = await loadTenant(academiaId);
  const orphan = platform.orphanTenantUsers ?? [];
  return {
    version: platform.version,
    platformSettings: platform.platformSettings,
    academias: platform.academias,
    users: [...platform.users, ...orphan, ...t.users],
    students: t.students,
    plans: t.plans,
    professors: t.professors,
    workouts: t.workouts,
    classes: t.classes,
    notices: t.notices,
    attendance: t.attendance,
  };
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

/** Grava `platform.json` + pasta/arquivo por academia e remove diretórios de unidades excluídas. */
export async function persistMergedDatabase(merged: AppDatabase): Promise<void> {
  await ensureDirs();
  await migrateFlatTenantJsonToSubfolders();
  const { platform, tenants } = splitMergedToParts(merged);
  await savePlatform(platform);
  await saveProxyPlatformView(platform).catch(() => {});
  await savePlatformPublicCopy(platform).catch(() => {});

  for (const [id, t] of tenants) {
    await saveTenant(id, t);
  }

  const usedSafes = new Set(platform.academias.map((a) => tenantSafeDirName(a.id)));
  let entries: import("fs").Dirent[] = [];
  try {
    entries = await fs.readdir(TENANTS_DIR, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(TENANTS_DIR, ent.name);
    if (ent.name === ".gitkeep") continue;
    if (ent.isDirectory()) {
      if (!usedSafes.has(ent.name)) {
        await fs.rm(full, { recursive: true, force: true }).catch(() => {});
      }
      continue;
    }
    if (ent.isFile() && ent.name.endsWith(".json")) {
      const safe = ent.name.replace(/\.json$/, "");
      if (!usedSafes.has(safe)) {
        await fs.unlink(full).catch(() => {});
      }
    }
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
  await migrateFlatTenantJsonToSubfolders();

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

type ProxyReadCache = {
  path: string;
  mtimeMs: number;
  size: number;
  data: PlatformRegistryProxyView | null;
};

let proxyRegistryReadCache: ProxyReadCache | null = null;

async function readProxyViewFromDisk(
  filePath: string,
): Promise<PlatformRegistryProxyView | null> {
  try {
    const st = await fs.stat(filePath);
    if (
      proxyRegistryReadCache &&
      proxyRegistryReadCache.path === filePath &&
      proxyRegistryReadCache.mtimeMs === st.mtimeMs &&
      proxyRegistryReadCache.size === Number(st.size)
    ) {
      return proxyRegistryReadCache.data;
    }
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as PlatformRegistryProxyView;
    proxyRegistryReadCache = {
      path: filePath,
      mtimeMs: st.mtimeMs,
      size: Number(st.size),
      data: parsed,
    };
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Leitura leve para o `proxy.ts`: prefere `data/proxy-platform.json` (KB);
 * se não existir, cai no `platform.json` completo (legado / primeiro deploy).
 * Cache por mtime evita re-parse a cada request na mesma instância.
 */
export async function readPlatformRegistryForProxy(): Promise<PlatformRegistryProxyView | null> {
  const lite = await readProxyViewFromDisk(PROXY_PLATFORM_PATH);
  if (lite) return lite;

  try {
    const st = await fs.stat(PLATFORM_PATH);
    if (
      proxyRegistryReadCache &&
      proxyRegistryReadCache.path === PLATFORM_PATH &&
      proxyRegistryReadCache.mtimeMs === st.mtimeMs &&
      proxyRegistryReadCache.size === Number(st.size)
    ) {
      return proxyRegistryReadCache.data;
    }
    const raw = await fs.readFile(PLATFORM_PATH, "utf-8");
    const full = JSON.parse(raw) as PlatformRegistry;
    const view = platformRegistryToProxyView(full);
    proxyRegistryReadCache = {
      path: PLATFORM_PATH,
      mtimeMs: st.mtimeMs,
      size: Number(st.size),
      data: view,
    };
    return view;
  } catch {
    return null;
  }
}

/**
 * Leitura para rotas quentes (hub, `/api/auth/me`, público). Prefere `platform-public.json`
 * (sem logos base64); se ausente, usa `readPlatformRegistry()`.
 */
export async function readPlatformRegistryPublic(): Promise<PlatformRegistry> {
  try {
    const raw = await fs.readFile(PLATFORM_PUBLIC_PATH, "utf-8");
    return JSON.parse(raw) as PlatformRegistry;
  } catch {
    return readPlatformRegistry();
  }
}

/** Lê só o cadastro global (academias + ultra), sem carregar tenants. */
export async function readPlatformRegistry(): Promise<PlatformRegistry> {
  await ensureDirs();
  await migrateLegacyDatabaseIfPresent();
  await migrateFlatTenantJsonToSubfolders();
  try {
    return await loadPlatform();
  } catch {
    const seed = createSeedDatabase();
    await persistMergedDatabase(seed);
    return (await loadPlatform()) as PlatformRegistry;
  }
}
