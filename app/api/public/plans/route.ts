import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TENANT_COOKIE_NAME } from "@/lib/auth/tenant-cookie";
import { readDatabase } from "@/lib/db/file-store";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";

/** Planos da unidade escolhida (cookie público ou vazio). */
export async function GET() {
  const jar = await cookies();
  const tenantId = jar.get(TENANT_COOKIE_NAME)?.value ?? null;
  if (!tenantId) {
    return NextResponse.json({ plans: [] as const });
  }
  const db = await readDatabase();
  const a = db.academias.find((x) => x.id === tenantId);
  if (!a || a.status !== "ativo" || isAcademiaPlataformaDesligada(db, tenantId)) {
    return NextResponse.json({ plans: [] as const });
  }
  const plans = db.plans
    .filter((p) => p.academiaId === tenantId)
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      precoMensal: p.precoMensal,
      beneficios: p.beneficios,
      destaque: Boolean(p.destaque),
    }));
  return NextResponse.json({ plans });
}
