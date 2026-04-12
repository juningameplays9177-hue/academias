import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { canAccessPath, canUseAdminApi } from "@/lib/rbac/route-guards";
import type { RoleId } from "@/lib/rbac/roles";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
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

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

async function fetchSitePublicOff(request: NextRequest): Promise<boolean> {
  try {
    const url = new URL("/api/site/public-status", request.nextUrl.origin);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return false;
    const j = (await res.json()) as { sitePublicoDesligado?: boolean };
    return Boolean(j.sitePublicoDesligado);
  } catch {
    return false;
  }
}

function homeForRole(role: RoleId): string {
  switch (role) {
    case "ultra_admin":
      return "/ultra";
    case "admin":
      return "/admin";
    case "professor":
      return "/professor";
    case "aluno":
      return "/aluno";
    default:
      return "/";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;

  if (isStaticPath(pathname)) return NextResponse.next();
  if (pathname === "/api/site/public-status") return NextResponse.next();
  if (pathname === "/manutencao") return NextResponse.next();

  const publicOff = await fetchSitePublicOff(request);
  const isUltra = session?.role === "ultra_admin";

  if (publicOff && !isUltra) {
    if (pathname === "/login") return NextResponse.next();
    if (
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/register") ||
      pathname === "/api/auth/logout"
    ) {
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

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/ultra") && session?.role !== "ultra_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (pathname.startsWith("/api/admin") && !canUseAdminApi(session?.role as RoleId)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (
      pathname.startsWith("/api/professor") &&
      session?.role !== "professor" &&
      session?.role !== "ultra_admin"
    ) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (
      pathname.startsWith("/api/aluno") &&
      session?.role !== "aluno" &&
      session?.role !== "ultra_admin"
    ) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (!canAccessPath(session.role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = homeForRole(session.role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
