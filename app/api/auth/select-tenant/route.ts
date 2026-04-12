import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createSessionPayload,
  decodeSessionPayload,
  encodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME, tenantCookieOptions } from "@/lib/auth/tenant-cookie";
import { readDatabase } from "@/lib/db/file-store";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import type { RoleId } from "@/lib/rbac/roles";
import { tenantMatchesMembership } from "@/lib/tenancy/principal-in-tenant";

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
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  if (!session?.needsTenantSelection) {
    return NextResponse.json(
      { error: "Seleção de academia não necessária ou sessão inválida." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { academiaId?: string };
  const academiaId = body.academiaId?.trim();
  if (!academiaId) {
    return NextResponse.json({ error: "academiaId obrigatório." }, { status: 400 });
  }

  if (!tenantMatchesMembership(session, academiaId)) {
    return NextResponse.json({ error: "Academia não disponível para este login." }, { status: 403 });
  }

  const db = await readDatabase();
  const choice = session.memberships?.find((m) => m.academiaId === academiaId);
  if (!choice) {
    return NextResponse.json({ error: "Opção inválida." }, { status: 400 });
  }

  const a = db.academias.find((x) => x.id === academiaId);
  if (!a || a.status !== "ativo") {
    return NextResponse.json({ error: "Academia inativa." }, { status: 400 });
  }
  if (isAcademiaPlataformaDesligada(db, academiaId)) {
    return NextResponse.json(
      {
        error:
          "Esta unidade está temporariamente suspensa. Escolha outra academia ou contate o suporte.",
      },
      { status: 503 },
    );
  }

  const nextPayload = createSessionPayload({
    sub: choice.principalId,
    email: session.email,
    name: choice.displayName ?? session.name,
    role: choice.role,
    needsTenantSelection: false,
    memberships: session.memberships,
  });

  const encoded = encodeSessionPayload(nextPayload);
  const res = NextResponse.json({
    ok: true,
    redirectTo: dashboardPath(choice.role),
  });
  res.cookies.set(SESSION_COOKIE_NAME, encoded, sessionCookieBase());
  res.cookies.set(
    TENANT_COOKIE_NAME,
    academiaId,
    tenantCookieOptions(SESSION_MAX_AGE),
  );
  return res;
}
