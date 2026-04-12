import type { AppDatabase } from "@/lib/db/types";
import type { RoleId } from "@/lib/rbac/roles";
import type { TenantMembership } from "@/lib/auth/session-cookie";
import { DEMO_PASSWORD } from "@/lib/db/seed";

export type ResolvedAuthUser = {
  id: string;
  email: string;
  name: string;
  role: RoleId;
  academiaId: string | null;
};

export type LoginMatch = ResolvedAuthUser;

function staffIsBlocked(u: { status?: string }): boolean {
  return u.status === "bloqueado";
}

function academiaMeta(
  db: AppDatabase,
  academiaId: string | null,
): { academiaNome: string; slug: string } {
  if (!academiaId) {
    return { academiaNome: "Plataforma", slug: "plataforma" };
  }
  const a = db.academias.find((x) => x.id === academiaId);
  return {
    academiaNome: a?.nome ?? "Academia",
    slug: a?.slug ?? academiaId,
  };
}

export function loginMatchesToMemberships(
  db: AppDatabase,
  matches: LoginMatch[],
): TenantMembership[] {
  return matches
    .filter((m) => m.role !== "ultra_admin" && m.academiaId)
    .map((m) => {
      const meta = academiaMeta(db, m.academiaId);
      return {
        academiaId: m.academiaId as string,
        principalId: m.id,
        role: m.role,
        academiaNome: meta.academiaNome,
        slug: meta.slug,
        displayName: m.name,
      };
    });
}

/** Resolve todas as combinações e-mail+senha válidas (multi-academia). */
export function resolveLoginMatches(
  db: AppDatabase,
  email: string,
  password: string,
): LoginMatch[] {
  const normalized = email.trim().toLowerCase();
  const out: LoginMatch[] = [];
  const seen = new Set<string>();

  const push = (m: LoginMatch) => {
    const k = `${m.academiaId ?? "null"}:${m.id}:${m.role}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(m);
  };

  for (const u of db.users) {
    if (u.email.toLowerCase() !== normalized) continue;
    if (staffIsBlocked(u) || u.password !== password) continue;
    push({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      academiaId: u.academiaId ?? null,
    });
  }

  for (const p of db.professors) {
    if (p.email.toLowerCase() !== normalized) continue;
    if (p.contaBloqueada) continue;
    const pwd =
      typeof p.senhaPlataforma === "string" && p.senhaPlataforma.length > 0
        ? p.senhaPlataforma
        : DEMO_PASSWORD;
    if (password !== pwd) continue;
    push({
      id: p.id,
      email: p.email,
      name: p.nome,
      role: "professor",
      academiaId: p.academiaId,
    });
  }

  for (const s of db.students) {
    if (s.email.toLowerCase() !== normalized) continue;
    if (s.status === "bloqueado" || s.status === "inativo") continue;
    const hasOwnPassword =
      typeof s.password === "string" && s.password.length > 0;
    const passwordOk = hasOwnPassword
      ? s.password === password
      : password === DEMO_PASSWORD;
    if (!passwordOk) continue;
    push({
      id: s.id,
      email: s.email,
      name: s.nome,
      role: "aluno",
      academiaId: s.academiaId,
    });
  }

  return out;
}

/** @deprecated use resolveLoginMatches — primeiro match apenas */
export function resolveLogin(
  db: AppDatabase,
  email: string,
  password: string,
): ResolvedAuthUser | null {
  const all = resolveLoginMatches(db, email, password);
  return all[0] ?? null;
}
