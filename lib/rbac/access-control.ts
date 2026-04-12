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

function isUltraAdminPath(pathname: string): boolean {
  return (
    pathname.startsWith("/ultra-admin") ||
    pathname.startsWith("/api/ultra-admin") ||
    pathname.startsWith("/api/academias")
  );
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

function isProfessorPath(pathname: string): boolean {
  return (
    pathname.startsWith("/professor") || pathname.startsWith("/api/professor")
  );
}

function isAlunoPath(pathname: string): boolean {
  return pathname.startsWith("/aluno") || pathname.startsWith("/api/aluno");
}

/**
 * Rotas de páginas e APIs (exceto públicas).
 * Ultra Admin não entra em painéis de professor/aluno (dados amarrados a pessoa física).
 */
export function canAccessPath(role: RoleId, pathname: string): boolean {
  if (isUltraAdminPath(pathname)) {
    return role === "ultra_admin";
  }
  if (isAdminPath(pathname)) {
    return role === "admin" || role === "ultra_admin";
  }
  if (isProfessorPath(pathname)) {
    return role === "professor";
  }
  if (isAlunoPath(pathname)) {
    return role === "aluno";
  }
  return true;
}

/** Alias RBAC: `canAccess(user.role, "/admin")` — mesma regra de `canAccessPath`. */
export function canAccess(role: RoleId, pathname: string): boolean {
  return canAccessPath(role, pathname);
}

/** @deprecated use canAccessPath — mantido para imports legados */
export function requiredRoleForPath(pathname: string): RoleId | null {
  if (pathname.startsWith("/ultra-admin")) return "ultra_admin";
  if (pathname.startsWith("/api/academias")) return "ultra_admin";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/professor")) return "professor";
  if (pathname.startsWith("/aluno")) return "aluno";
  return null;
}
