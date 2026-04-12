import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import type { PlanRecord } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const ctxReq = await requireTenantAdminContext();
  if (ctxReq instanceof NextResponse) return ctxReq;
  const { tenantId, db } = ctxReq;
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<PlanRecord>;

  const idx = db.plans.findIndex((p) => p.id === id && p.academiaId === tenantId);
  if (idx === -1) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const current = db.plans[idx];
  const updated: PlanRecord = {
    ...current,
    ...patch,
    academiaId: tenantId,
    nome: patch.nome?.trim() ?? current.nome,
    precoMensal:
      patch.precoMensal !== undefined
        ? Number(patch.precoMensal)
        : current.precoMensal,
    beneficios: patch.beneficios ?? current.beneficios,
  };

  await mutateDatabase((draft) => {
    const i = draft.plans.findIndex((p) => p.id === id && p.academiaId === tenantId);
    if (i !== -1) draft.plans[i] = updated;
  });

  return NextResponse.json({ plan: updated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const ctxReq = await requireTenantAdminContext();
  if (ctxReq instanceof NextResponse) return ctxReq;
  const { tenantId, db } = ctxReq;
  const { id } = await ctx.params;
  const inUse = db.students.some(
    (s) => s.academiaId === tenantId && s.planoId === id,
  );
  if (inUse) {
    return NextResponse.json(
      { error: "Plano vinculado a alunos — altere os vínculos antes." },
      { status: 409 },
    );
  }
  await mutateDatabase((draft) => {
    draft.plans = draft.plans.filter(
      (p) => !(p.id === id && p.academiaId === tenantId),
    );
  });
  return NextResponse.json({ ok: true });
}
