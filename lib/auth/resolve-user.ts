import type { AppDatabase } from "@/lib/db/types";
import type { RoleId } from "@/lib/rbac/roles";
import { DEMO_PASSWORD } from "@/lib/db/seed";

export type ResolvedAuthUser = {
  id: string;
  email: string;
  name: string;
  role: RoleId;
};

function staffIsBlocked(u: { status?: string }): boolean {
  return u.status === "bloqueado";
}

export function resolveLogin(
  db: AppDatabase,
  email: string,
  password: string,
): ResolvedAuthUser | null {
  const normalized = email.trim().toLowerCase();

  const adminUser = db.users.find(
    (u) => u.email.toLowerCase() === normalized,
  );
  if (adminUser && !staffIsBlocked(adminUser) && adminUser.password === password) {
    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    };
  }

  const professor = db.professors.find(
    (p) => p.email.toLowerCase() === normalized,
  );
  if (professor && !professor.contaBloqueada) {
    const pwd =
      typeof professor.senhaPlataforma === "string" &&
      professor.senhaPlataforma.length > 0
        ? professor.senhaPlataforma
        : DEMO_PASSWORD;
    if (password === pwd) {
      return {
        id: professor.id,
        email: professor.email,
        name: professor.nome,
        role: "professor",
      };
    }
  }

  const student = db.students.find(
    (s) => s.email.toLowerCase() === normalized,
  );
  if (student && student.status !== "bloqueado" && student.status !== "inativo") {
    const hasOwnPassword =
      typeof student.password === "string" && student.password.length > 0;
    const passwordOk = hasOwnPassword
      ? student.password === password
      : password === DEMO_PASSWORD;
    if (passwordOk) {
      return {
        id: student.id,
        email: student.email,
        name: student.nome,
        role: "aluno",
      };
    }
  }

  return null;
}
