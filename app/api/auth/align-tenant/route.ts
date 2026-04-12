import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME, tenantCookieOptions } from "@/lib/auth/tenant-cookie";
import { readDatabase } from "@/lib/db/file-store";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import { assertTenantScope } from "@/lib/tenancy/principal-in-tenant";
import { recordToTenantAcademia } from "@/lib/tenant/branding";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Garante que o cookie de unidade bate com a academia do usuário logado
 * (ex.: abrir o site institucional a partir do painel).
 */
export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (session.needsTenantSelection) {
    return NextResponse.json(
      { error: "Selecione a academia no hub antes de abrir o site." },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { slug?: string };
  const db = await readDatabase();

  let targetId: string | null = null;
  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";

  if (slugRaw) {
    const s = slugRaw.toLowerCase();
    const a = db.academias.find((x) => x.slug.toLowerCase() === s) ?? null;
    if (!a) {
      return NextResponse.json({ error: "Academia não encontrada." }, { status: 404 });
    }
    if (a.status !== "ativo") {
      return NextResponse.json({ error: "Unidade inativa." }, { status: 400 });
    }
    if (!assertTenantScope(db, session, a.id)) {
      return NextResponse.json({ error: "Acesso negado a esta unidade." }, { status: 403 });
    }
    targetId = a.id;
  } else {
    const list = session.memberships ?? [];
    if (list.length !== 1) {
      return NextResponse.json(
        {
          error:
            "Informe a unidade (slug) ou use um login vinculado a uma única academia.",
        },
        { status: 400 },
      );
    }
    targetId = list[0].academiaId;
    if (!assertTenantScope(db, session, targetId)) {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 403 });
    }
  }

  if (!targetId) {
    return NextResponse.json({ error: "Unidade inválida." }, { status: 400 });
  }
  if (isAcademiaPlataformaDesligada(db, targetId)) {
    return NextResponse.json(
      { error: "Esta unidade está temporariamente suspensa." },
      { status: 503 },
    );
  }

  const a = db.academias.find((x) => x.id === targetId) ?? null;
  if (!a) {
    return NextResponse.json({ error: "Academia não encontrada." }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true, tenant: recordToTenantAcademia(a) });
  res.cookies.set(TENANT_COOKIE_NAME, targetId, tenantCookieOptions(COOKIE_MAX_AGE));
  return res;
}
