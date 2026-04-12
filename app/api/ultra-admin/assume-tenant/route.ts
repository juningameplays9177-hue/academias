import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { TENANT_COOKIE_NAME, tenantCookieOptions } from "@/lib/auth/tenant-cookie";
import { readDatabase } from "@/lib/db/file-store";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Ultra Admin escolhe unidade para operar painéis admin (cookie de tenant). */
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as { academiaId?: string };
  const academiaId = body.academiaId?.trim();
  if (!academiaId) {
    return NextResponse.json({ error: "academiaId obrigatório." }, { status: 400 });
  }
  const db = await readDatabase();
  const a = db.academias.find((x) => x.id === academiaId);
  if (!a || a.status !== "ativo") {
    return NextResponse.json({ error: "Academia inválida." }, { status: 400 });
  }
  const res = NextResponse.json({
    ok: true,
    tenant: { id: a.id, nome: a.nome, slug: a.slug },
  });
  res.cookies.set(
    TENANT_COOKIE_NAME,
    academiaId,
    tenantCookieOptions(SESSION_MAX_AGE),
  );
  return res;
}
