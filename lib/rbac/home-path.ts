import type { RoleId } from "@/lib/rbac/roles";

/** Destino padrão do painel após login / escolha de unidade. */
export function homePathForRole(role: RoleId): string {
  switch (role) {
    case "ultra_admin":
      return "/ultra-admin";
    case "admin":
      return "/admin";
    case "professor":
      return "/professor";
    case "aluno":
      return "/aluno";
    default:
      return "/site";
  }
}
