import type { AppDatabase } from "@/lib/db/types";
import type { SessionPayload } from "@/lib/auth/session-cookie";

/** O principal (sub da sessão) pertence ao tenant indicado no banco? */
export function isPrincipalInTenant(
  db: AppDatabase,
  session: SessionPayload,
  tenantId: string,
): boolean {
  if (session.role === "ultra_admin") {
    return db.academias.some((a) => a.id === tenantId && a.status === "ativo");
  }
  if (session.role === "admin") {
    const u = db.users.find((x) => x.id === session.sub);
    return !!u && u.academiaId === tenantId;
  }
  if (session.role === "professor") {
    const p = db.professors.find((x) => x.id === session.sub);
    return !!p && p.academiaId === tenantId;
  }
  if (session.role === "aluno") {
    const s = db.students.find((x) => x.id === session.sub);
    return !!s && s.academiaId === tenantId;
  }
  return false;
}

/** Cookie de tenant alinhado às memberships gravadas no login (anti-fraude simples). */
export function tenantMatchesMembership(
  session: SessionPayload,
  tenantId: string,
): boolean {
  const list = session.memberships ?? [];
  return list.some((m) => m.academiaId === tenantId);
}

export function assertTenantScope(
  db: AppDatabase,
  session: SessionPayload,
  tenantId: string | null | undefined,
): boolean {
  if (!tenantId) return false;
  if (session.role === "ultra_admin") {
    return db.academias.some((a) => a.id === tenantId && a.status === "ativo");
  }
  if (!tenantMatchesMembership(session, tenantId)) return false;
  return isPrincipalInTenant(db, session, tenantId);
}
