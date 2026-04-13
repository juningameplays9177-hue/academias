import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME } from "@/lib/auth/tenant-cookie";
import { readPlatformRegistry } from "@/lib/db/file-store";
import type { PlatformRegistry } from "@/lib/db/types";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import { isSitePublicOff } from "@/lib/platform/site-public-off";
import { homePathForRole } from "@/lib/rbac/home-path";
import { canAccessPath, canUseAdminApi } from "@/lib/rbac/route-guards";
import type { RoleId } from "@/lib/rbac/roles";

const PUBLIC_PATHS = new Set([
  "/login",
  "/select-academia",
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
 * Lê só `data/platform.json` (sem mesclar tenants), evitando `fetch` para a própria origem
 * no proxy — isso podia travar o worker em dev e gerar 503/timeouts.
 */
async function loadPlatformOnce(): Promise<PlatformRegistry | null> {
  try {
    return await readPlatformRegistry();
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  const tenantId = request.cookies.get(TENANT_COOKIE_NAME)?.value ?? null;

  if (isStaticPath(pathname)) return NextResponse.next();
  if (pathname === "/api/site/public-status") return NextResponse.next();
  if (pathname === "/api/site/tenant-plataforma-off") return NextResponse.next();
  if (pathname === "/manutencao") return NextResponse.next();

  const p = await loadPlatformOnce();
  const publicOff = p ? isSitePublicOff(p) : false;
  const isUltra = session?.role === "ultra_admin";

  if (publicOff && !isUltra) {
    if (pathname === "/login") return NextResponse.next();
    if (pathname === "/manutencao-unidade") return NextResponse.next();
    if (
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/register") ||
      pathname === "/api/auth/logout"
    ) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/public/")) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Site em manutenção. Apenas Ultra Admin pode usar a API agora." },
        { status: 503 },
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/manutencao";
    return NextResponse.redirect(url);
  }

  if (pathname === "/manutencao-unidade") {
    return NextResponse.next();
  }

  if (!publicOff && pathname === "/") {
    return NextResponse.redirect(new URL("/select-academia", request.url));
  }

  if (pathname === "/login" && session?.needsTenantSelection) {
    return NextResponse.redirect(new URL("/select-academia", request.url));
  }
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(homePathForRole(session.role), request.url));
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
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (session.needsTenantSelection && pathname !== "/select-academia") {
    const url = request.nextUrl.clone();
    url.pathname = "/select-academia";
    return NextResponse.redirect(url);
  }

  if (
    pathNeedsTenantCookie(pathname) &&
    !tenantId &&
    session.role === "ultra_admin"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/ultra-admin";
    return NextResponse.redirect(url);
  }

  if (
    pathNeedsTenantCookie(pathname) &&
    !tenantId &&
    session.role !== "ultra_admin"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/select-academia";
    return NextResponse.redirect(url);
  }

  if (!canAccessPath(session.role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = homePathForRole(session.role);
    return NextResponse.redirect(url);
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
      const url = request.nextUrl.clone();
      url.pathname = "/manutencao-unidade";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
