import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createSessionPayload,
  encodeSessionPayload,
} from "@/lib/auth/session-cookie";
import {
  loginMatchesToMemberships,
  resolveLoginMatches,
} from "@/lib/auth/resolve-user";
import { TENANT_COOKIE_NAME, tenantCookieOptions } from "@/lib/auth/tenant-cookie";
import { readDatabase } from "@/lib/db/file-store";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import { isSitePublicOff } from "@/lib/platform/site-public-off";
import type { RoleId } from "@/lib/rbac/roles";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function sessionCookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

function dashboardPath(role: RoleId): string {
  if (role === "ultra_admin") return "/ultra-admin";
  if (role === "admin") return "/admin";
  if (role === "professor") return "/professor";
  return "/aluno";
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    academiaSlug?: string;
  };
  const email = body.email ?? "";
  const password = body.password ?? "";
  const academiaSlug = body.academiaSlug?.trim().toLowerCase() ?? "";

  const db = await readDatabase();
  let matches = resolveLoginMatches(db, email, password);
  if (!matches.length) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  if (academiaSlug) {
    const targetAcademia = db.academias.find(
      (a) => a.slug.toLowerCase() === academiaSlug,
    );
    if (!targetAcademia || targetAcademia.status !== "ativo") {
      return NextResponse.json(
        { error: "Unidade inválida ou indisponível para login." },
        { status: 400 },
      );
    }
    matches = matches.filter((m) => {
      if (m.role === "ultra_admin") return true;
      return m.academiaId === targetAcademia.id;
    });
    if (!matches.length) {
      return NextResponse.json(
        {
          error:
            "Este usuário não pertence à academia selecionada. Entre pela unidade correta.",
        },
        { status: 403 },
      );
    }
  }

  matches = matches.filter((m) => {
    if (m.role === "ultra_admin") return true;
    if (!m.academiaId) return true;
    return !isAcademiaPlataformaDesligada(db, m.academiaId);
  });
  if (!matches.length) {
    return NextResponse.json(
      {
        error:
          "Suas unidades estão temporariamente suspensas. Só o Ultra Admin pode acessar a plataforma neste momento.",
      },
      { status: 503 },
    );
  }

  if (isSitePublicOff(db)) {
    matches = matches.filter((m) => m.role === "ultra_admin");
    if (!matches.length) {
      return NextResponse.json(
        {
          error:
            "Site em manutenção. Neste momento só o Ultra Admin pode entrar na plataforma.",
        },
        { status: 503 },
      );
    }
  }

  const ultraOnly =
    matches.length === 1 && matches[0].role === "ultra_admin";

  if (ultraOnly) {
    const u = matches[0];
    const payload = createSessionPayload({
      sub: u.id,
      email: u.email,
      name: u.name,
      role: "ultra_admin",
      needsTenantSelection: false,
      memberships: [],
    });
    const token = encodeSessionPayload(payload);
    const res = NextResponse.json({
      ok: true,
      redirectTo: dashboardPath("ultra_admin"),
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as RoleId,
      },
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieBase());
    res.cookies.set(TENANT_COOKIE_NAME, "", { ...tenantCookieOptions(0), maxAge: 0 });
    return res;
  }

  const memberships = loginMatchesToMemberships(db, matches);

  if (matches.length === 1) {
    const m = matches[0];
    if (m.role === "ultra_admin") {
      return NextResponse.json({ error: "Estado inválido." }, { status: 500 });
    }
    const payload = createSessionPayload({
      sub: m.id,
      email: m.email,
      name: m.name,
      role: m.role,
      needsTenantSelection: false,
      memberships,
    });
    const token = encodeSessionPayload(payload);
    const res = NextResponse.json({
      ok: true,
      redirectTo: dashboardPath(m.role),
      user: {
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
      },
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieBase());
    if (m.academiaId) {
      res.cookies.set(
        TENANT_COOKIE_NAME,
        m.academiaId,
        tenantCookieOptions(SESSION_MAX_AGE),
      );
    }
    return res;
  }

  const first = matches[0];
  const payload = createSessionPayload({
    sub: first.id,
    email: first.email,
    name: first.name,
    role: first.role,
    needsTenantSelection: true,
    memberships,
  });
  const token = encodeSessionPayload(payload);
  const res = NextResponse.json({
    ok: true,
    needsTenantSelection: true,
    tenantChoices: memberships,
    user: {
      id: first.id,
      email: first.email,
      name: first.name,
      role: first.role,
    },
  });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieBase());
  res.cookies.set(TENANT_COOKIE_NAME, "", { ...tenantCookieOptions(0), maxAge: 0 });
  return res;
}
