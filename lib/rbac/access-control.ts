import type { RoleId } from "@/lib/rbac/roles";

export function isUltraAdmin(role: RoleId): boolean {
  return role === "ultra_admin";
}

export function isAdminRole(role: RoleId): boolean {
  return role === "admin" || role === "ultra_admin";
}

/**
 * Painel e APIs administrativas (admin clássico + ultra).
 */
export function canUseAdminApi(role: RoleId): boolean {
  return isAdminRole(role);
}

/**
 * Rotas de páginas e APIs (exceto públicas): ultra acessa todos os painéis.
 */
export function canAccessPath(role: RoleId, pathname: string): boolean {
  if (pathname.startsWith("/ultra") || pathname.startsWith("/api/ultra")) {
    return role === "ultra_admin";
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return role === "admin" || role === "ultra_admin";
  }
  if (pathname.startsWith("/professor") || pathname.startsWith("/api/professor")) {
    return role === "professor" || role === "ultra_admin";
  }
  if (pathname.startsWith("/aluno") || pathname.startsWith("/api/aluno")) {
    return role === "aluno" || role === "ultra_admin";
  }
  return true;
}

/** Alias RBAC: `canAccess(user.role, "/admin")` — mesma regra de `canAccessPath`. */
export function canAccess(role: RoleId, pathname: string): boolean {
  return canAccessPath(role, pathname);
}

/** @deprecated use canAccessPath — mantido para imports legados */
export function requiredRoleForPath(pathname: string): RoleId | null {
  if (pathname.startsWith("/ultra")) return "ultra_admin";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/professor")) return "professor";
  if (pathname.startsWith("/aluno")) return "aluno";
  return null;
}
