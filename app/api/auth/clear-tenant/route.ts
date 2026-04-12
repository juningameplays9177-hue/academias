import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createSessionPayload,
  decodeSessionPayload,
  encodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME, tenantCookieOptions } from "@/lib/auth/tenant-cookie";

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

/** Mantém identidade e volta ao fluxo de escolha de academia (multi-tenant). */
export async function POST() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.role === "ultra_admin") {
    return NextResponse.json(
      { error: "Ultra Admin não usa troca de academia neste fluxo." },
      { status: 400 },
    );
  }

  const memberships = session.memberships ?? [];
  if (memberships.length <= 1) {
    return NextResponse.json(
      { error: "Conta vinculada a uma única academia." },
      { status: 400 },
    );
  }

  const nextPayload = createSessionPayload({
    sub: session.sub,
    email: session.email,
    name: session.name,
    role: session.role,
    needsTenantSelection: true,
    memberships,
  });

  const res = NextResponse.json({ ok: true, redirectTo: "/select-academia" });
  res.cookies.set(SESSION_COOKIE_NAME, encodeSessionPayload(nextPayload), sessionCookieBase());
  res.cookies.set(TENANT_COOKIE_NAME, "", { ...tenantCookieOptions(0), maxAge: 0 });
  return res;
}
