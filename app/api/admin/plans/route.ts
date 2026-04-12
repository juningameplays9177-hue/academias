import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import type { PlanRecord } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, db } = ctx;
  return NextResponse.json({
    plans: db.plans.filter((p) => p.academiaId === tenantId),
  });
}

export async function POST(request: Request) {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId } = ctx;
  const body = (await request.json()) as Partial<PlanRecord>;
  const plan: PlanRecord = {
    id: crypto.randomUUID(),
    academiaId: tenantId,
    nome: body.nome?.trim() || "Novo plano",
    precoMensal: Number(body.precoMensal) || 0,
    beneficios: Array.isArray(body.beneficios) ? body.beneficios : [],
    destaque: Boolean(body.destaque),
  };
  await mutateDatabase((db) => {
    db.plans.push(plan);
  });
  return NextResponse.json({ plan });
}
