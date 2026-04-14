import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME } from "@/lib/auth/tenant-cookie";
import { readPlatformRegistryForProxy } from "@/lib/db/file-store";
import type { PlatformRegistryProxyView } from "@/lib/db/types";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import { isSitePublicOff } from "@/lib/platform/site-public-off";
import { homePathForRole } from "@/lib/rbac/home-path";
import { canAccessPath, canUseAdminApi } from "@/lib/rbac/route-guards";
import { isRoleId, type RoleId } from "@/lib/rbac/roles";
import { resolveTenantCookieRaw } from "@/lib/tenancy/tenant-cookie-resolve";

const PUBLIC_PATHS = new Set([
  "/login",
  "/site",
  "/api/auth/login",
  "/api/contact",
]);

function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images")
  );
}

/** Site institucional dedicado por unidade: `/a/{slug}` (cores e dados daquela academia). */
function isPublicAcademiaSitePath(pathname: string): boolean {
  if (!pathname.startsWith("/a/")) return false;
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && parts[0] === "a" && parts[1].length > 0;
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname === "/select-academia") return true;
  if (isPublicAcademiaSitePath(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/public/")) return true;
  return false;
}

function pathNeedsTenantCookie(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/professor") ||
    pathname.startsWith("/api/professor") ||
    pathname.startsWith("/aluno") ||
    pathname.startsWith("/api/aluno")
  );
}

/**
 * Leitura leve: sem migrações/seed (isso fica em `readPlatformRegistry` nas rotas API).
 */
async function loadPlatformOnce(): Promise<PlatformRegistryProxyView | null> {
  try {
    return await readPlatformRegistryForProxy();
  } catch {
    return null;
  }
}

/** Query só para Flight/RSC — navegação “documento” não deve enviar (senão o browser mostra `:HL[...]`). */
function stripDocumentShouldNotCarryRscParams(url: URL): boolean {
  let changed = false;
  for (const key of [...url.searchParams.keys()]) {
    if (
      key === "_rsc" ||
      key === "__nextDataReq" ||
      key.startsWith("_next") ||
      key.startsWith("__next") ||
      key === "flight"
    ) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  return changed;
}

function clearInternalNextQuery(url: URL) {
  stripDocumentShouldNotCarryRscParams(url);
}

function redirectWithCleanQuery(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  clearInternalNextQuery(url);
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

/**
 * Requisições Flight/RSC do App Router (Next.js) — precisam manter `_rsc` e headers.
 * Ver `next/dist/client/components/app-router-headers.js` (RSC_HEADER, FLIGHT_HEADERS).
 */
function isNextFlightRequest(request: NextRequest): boolean {
  const h = request.headers;
  const rsc = h.get("rsc");
  if (rsc === "1" || rsc === "true") return true;
  if (h.has("next-router-state-tree")) return true;
  if (h.get("next-router-prefetch")) return true;
  if (h.get("next-router-segment-prefetch")) return true;
  if (h.get("next-hmr-refresh")) return true;
  const accept = h.get("Accept") ?? "";
  if (accept.includes("text/x-component")) return true;
  return false;
}

/** Navegação HTML típica — não é cliente RSC pedindo `text/x-component`. */
function looksLikeBrowserDocumentNavigation(request: NextRequest): boolean {
  if (isNextFlightRequest(request)) return false;
  const dest = request.headers.get("Sec-Fetch-Dest");
  if (dest === "document") return true;
  const accept = request.headers.get("Accept") ?? "";
  if (accept.includes("text/html") && !accept.includes("text/x-component")) {
    return true;
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  const tenantCookieRaw = request.cookies.get(TENANT_COOKIE_NAME)?.value ?? null;

  if (isStaticPath(pathname)) return NextResponse.next();
  if (pathname === "/api/site/public-status") return NextResponse.next();
  if (pathname === "/api/site/tenant-plataforma-off") return NextResponse.next();
  if (pathname === "/manutencao") return NextResponse.next();
  if (pathname === "/api/health") return NextResponse.next();

  /**
   * Navegação documento com parâmetros internos do App Router / bookmark / CDN
   * sem headers Flight → resposta RSC “crua” na tela (`:HL[...]`).
   */
  if (
    request.method === "GET" &&
    !pathname.startsWith("/api/") &&
    looksLikeBrowserDocumentNavigation(request)
  ) {
    const clean = request.nextUrl.clone();
    if (stripDocumentShouldNotCarryRscParams(clean)) {
      return NextResponse.rewrite(clean);
    }
  }

  const p = await loadPlatformOnce();
  const tenantTrimmed = tenantCookieRaw?.trim() || null;
  const tenantId =
    tenantTrimmed && p
      ? (resolveTenantCookieRaw(p.academias, tenantTrimmed) ?? tenantTrimmed)
      : tenantTrimmed;
  const publicOff = p ? isSitePublicOff(p) : false;
  const isUltra = session?.role === "ultra_admin";

  if (publicOff && !isUltra) {
    if (pathname === "/login") return NextResponse.next();
    if (pathname === "/select-academia") return NextResponse.next();
    if (pathname === "/manutencao-unidade") return NextResponse.next();
    if (
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/register") ||
      pathname === "/api/auth/logout" ||
      pathname === "/api/auth/me" ||
      pathname.startsWith("/api/auth/select-tenant")
    ) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/public/")) {
      return NextResponse.next();
    }
    /** Site institucional off: painéis logados continuam (evita 503 em /api/aluno etc.). */
    const role = session?.role;
    const r = role && isRoleId(role) ? role : null;
    const tenantPanelApiOk =
      (pathname.startsWith("/api/aluno") && r === "aluno") ||
      (pathname.startsWith("/api/professor") && r === "professor") ||
      (pathname.startsWith("/api/admin") && r !== null && canUseAdminApi(r));
    if (tenantPanelApiOk) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Site em manutenção. Apenas Ultra Admin pode usar a API agora." },
        { status: 503 },
      );
    }
    const tenantPanelPageOk =
      (pathname.startsWith("/aluno") && r === "aluno") ||
      (pathname.startsWith("/professor") && r === "professor") ||
      (pathname.startsWith("/admin") && r !== null && canUseAdminApi(r));
    if (tenantPanelPageOk) {
      return NextResponse.next();
    }
    return redirectWithCleanQuery(request, "/manutencao");
  }

  if (pathname === "/manutencao-unidade") {
    return NextResponse.next();
  }

  if (!publicOff && pathname === "/") {
    if (session && !session.needsTenantSelection) {
      const role: RoleId = isRoleId(session.role) ? session.role : "aluno";
      return redirectWithCleanQuery(request, homePathForRole(role));
    }
    return redirectWithCleanQuery(request, "/select-academia");
  }

  if (pathname === "/login" && session?.needsTenantSelection) {
    return redirectWithCleanQuery(request, "/select-academia");
  }
  if (pathname === "/login" && session) {
    const role: RoleId = isRoleId(session.role) ? session.role : "aluno";
    return redirectWithCleanQuery(request, homePathForRole(role));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (
      pathname.startsWith("/api/ultra-admin") &&
      session?.role !== "ultra_admin"
    ) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (pathname.startsWith("/api/academias") && session?.role !== "ultra_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (pathname.startsWith("/api/admin") && !canUseAdminApi(session?.role as RoleId)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (pathname.startsWith("/api/professor") && session?.role !== "professor") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (pathname.startsWith("/api/aluno") && session?.role !== "aluno") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const needsTenantPlataformaCheck =
      session &&
      session.role !== "ultra_admin" &&
      tenantId &&
      p &&
      (pathname.startsWith("/api/admin") ||
        pathname.startsWith("/api/professor") ||
        pathname.startsWith("/api/aluno"));
    if (needsTenantPlataformaCheck) {
      const tenantOff = isAcademiaPlataformaDesligada(p, tenantId);
      if (tenantOff) {
        return NextResponse.json(
          {
            error:
              "Esta unidade está temporariamente suspensa pelo Ultra Admin.",
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.next();
  }

  if (!session) {
    const url = request.nextUrl.clone();
    clearInternalNextQuery(url);
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (
    session.needsTenantSelection &&
    session.role !== "ultra_admin" &&
    pathname !== "/select-academia"
  ) {
    return redirectWithCleanQuery(request, "/select-academia");
  }

  if (
    pathNeedsTenantCookie(pathname) &&
    !tenantId &&
    session.role === "ultra_admin"
  ) {
    return redirectWithCleanQuery(request, "/ultra-admin");
  }

  if (
    pathNeedsTenantCookie(pathname) &&
    !tenantId &&
    session.role !== "ultra_admin"
  ) {
    return redirectWithCleanQuery(request, "/select-academia");
  }

  if (!canAccessPath(session.role, pathname)) {
    return redirectWithCleanQuery(request, homePathForRole(session.role));
  }

  const tenantPagesSuspended =
    session &&
    session.role !== "ultra_admin" &&
    tenantId &&
    p &&
    pathNeedsTenantCookie(pathname);
  if (tenantPagesSuspended) {
    const tenantOff = isAcademiaPlataformaDesligada(p, tenantId);
    if (tenantOff) {
      return redirectWithCleanQuery(request, "/manutencao-unidade");
    }
  }

  return NextResponse.next();
}

/**
 * Não rodar proxy em APIs públicas/auth/site — evita 2× disco + parse na mesma navegação
 * (ex.: hub chama /api/auth/me + /api/public/academias enquanto o documento já passou no proxy).
 * Login/hub com site institucional off continuam permitidos no proxy; APIs acima não duplicam leitura de disco aqui.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/public/|api/auth/|api/site/).*)",
  ],
};
