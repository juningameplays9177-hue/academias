import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TENANT_COOKIE_NAME, tenantCookieOptions } from "@/lib/auth/tenant-cookie";
import { readPlatformRegistry } from "@/lib/db/file-store";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import { recordToTenantAcademia } from "@/lib/tenant/branding";

const MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const body = (await request.json()) as { academiaId?: string; slug?: string };
  const platform = await readPlatformRegistry();

  let a = null as (typeof platform.academias)[0] | null;
  const rawId = typeof body.academiaId === "string" ? body.academiaId.trim() : "";
  if (rawId) {
    a = platform.academias.find((x) => x.id === rawId) ?? null;
  } else if (typeof body.slug === "string" && body.slug.trim()) {
    const s = body.slug.trim().toLowerCase();
    a = platform.academias.find((x) => x.slug.toLowerCase() === s) ?? null;
  }

  if (!a) {
    return NextResponse.json({ error: "Academia não encontrada." }, { status: 404 });
  }
  if (a.status !== "ativo") {
    return NextResponse.json({ error: "Unidade inativa." }, { status: 400 });
  }
  if (isAcademiaPlataformaDesligada(platform, a.id)) {
    return NextResponse.json(
      { error: "Esta unidade está temporariamente indisponível no site." },
      { status: 503 },
    );
  }

  const res = NextResponse.json({
    ok: true,
    tenant: recordToTenantAcademia(a),
  });
  res.cookies.set(TENANT_COOKIE_NAME, a.id, tenantCookieOptions(MAX_AGE));
  return res;
}

/** Permite limpar unidade pública (volta ao hub). */
export async function DELETE() {
  const jar = await cookies();
  const res = NextResponse.json({ ok: true });
  if (jar.get(TENANT_COOKIE_NAME)?.value) {
    res.cookies.set(TENANT_COOKIE_NAME, "", { ...tenantCookieOptions(0), maxAge: 0 });
  }
  return res;
}
