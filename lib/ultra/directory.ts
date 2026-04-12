import type { AppDatabase } from "@/lib/db/types";
import type { RoleId } from "@/lib/rbac/roles";

export type DirectoryFilter = "all" | "admin" | "professor" | "aluno";

export type UnifiedAccount = {
  key: string;
  kind: "staff" | "professor" | "student";
  id: string;
  nome: string;
  email: string;
  role: RoleId;
  statusLabel: string;
  loginBloqueado: boolean;
};

function staffStatusLabel(s: { status?: string }): string {
  return s.status === "bloqueado" ? "bloqueado" : "ativo";
}

export function buildUnifiedDirectory(
  db: AppDatabase,
  filter: DirectoryFilter,
): UnifiedAccount[] {
  const rows: UnifiedAccount[] = [];

  for (const u of db.users) {
    rows.push({
      key: `staff:${u.id}`,
      kind: "staff",
      id: u.id,
      nome: u.name,
      email: u.email,
      role: u.role,
      statusLabel: staffStatusLabel(u),
      loginBloqueado: u.status === "bloqueado",
    });
  }

  for (const p of db.professors) {
    rows.push({
      key: `prof:${p.id}`,
      kind: "professor",
      id: p.id,
      nome: p.nome,
      email: p.email,
      role: "professor",
      statusLabel: p.contaBloqueada ? "bloqueado" : "ativo",
      loginBloqueado: Boolean(p.contaBloqueada),
    });
  }

  for (const s of db.students) {
    rows.push({
      key: `stu:${s.id}`,
      kind: "student",
      id: s.id,
      nome: s.nome,
      email: s.email,
      role: "aluno",
      statusLabel: s.status,
      loginBloqueado: s.status === "bloqueado" || s.status === "inativo",
    });
  }

  if (filter === "all") return rows;

  if (filter === "admin") {
    return rows.filter(
      (r) => r.kind === "staff" && (r.role === "admin" || r.role === "ultra_admin"),
    );
  }
  if (filter === "professor") {
    return rows.filter((r) => r.kind === "professor");
  }
  if (filter === "aluno") {
    return rows.filter((r) => r.kind === "student");
  }
  return rows;
}
