import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { PlanRecord } from "@/lib/db/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<PlanRecord>;

  const db = await readDatabase();
  const idx = db.plans.findIndex((p) => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const current = db.plans[idx];
  const updated: PlanRecord = {
    ...current,
    ...patch,
    nome: patch.nome?.trim() ?? current.nome,
    precoMensal:
      patch.precoMensal !== undefined
        ? Number(patch.precoMensal)
        : current.precoMensal,
    beneficios: patch.beneficios ?? current.beneficios,
  };

  await mutateDatabase((draft) => {
    const i = draft.plans.findIndex((p) => p.id === id);
    if (i !== -1) draft.plans[i] = updated;
  });

  return NextResponse.json({ plan: updated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = await readDatabase();
  const inUse = db.students.some((s) => s.planoId === id);
  if (inUse) {
    return NextResponse.json(
      { error: "Plano vinculado a alunos — altere os vínculos antes." },
      { status: 409 },
    );
  }
  await mutateDatabase((draft) => {
    draft.plans = draft.plans.filter((p) => p.id !== id);
  });
  return NextResponse.json({ ok: true });
}
