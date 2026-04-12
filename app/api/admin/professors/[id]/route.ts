import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import type { ProfessorRecord } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const ctxReq = await requireTenantAdminContext();
  if (ctxReq instanceof NextResponse) return ctxReq;
  const { tenantId, db } = ctxReq;
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<ProfessorRecord>;

  const idx = db.professors.findIndex((p) => p.id === id && p.academiaId === tenantId);
  if (idx === -1) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const current = db.professors[idx];
  const nextEmail = patch.email?.trim().toLowerCase() ?? current.email;
  if (nextEmail !== current.email.toLowerCase()) {
    const clash =
      db.professors.some(
        (p) =>
          p.id !== id &&
          p.academiaId === tenantId &&
          p.email.toLowerCase() === nextEmail,
      ) ||
      db.students.some(
        (s) => s.academiaId === tenantId && s.email.toLowerCase() === nextEmail,
      );
    if (clash) {
      return NextResponse.json({ error: "E-mail já usado" }, { status: 409 });
    }
  }
  const updated: ProfessorRecord = {
    ...current,
    ...patch,
    academiaId: tenantId,
    email: nextEmail,
    nome: patch.nome?.trim() ?? current.nome,
  };
  await mutateDatabase((d) => {
    const i = d.professors.findIndex((p) => p.id === id && p.academiaId === tenantId);
    if (i !== -1) d.professors[i] = updated;
  });
  return NextResponse.json({ professor: updated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const ctxReq = await requireTenantAdminContext();
  if (ctxReq instanceof NextResponse) return ctxReq;
  const { tenantId, db } = ctxReq;
  const { id } = await ctx.params;
  const inUse = db.students.some(
    (s) => s.academiaId === tenantId && s.professorId === id,
  );
  if (inUse) {
    return NextResponse.json(
      { error: "Professor com alunos vinculados." },
      { status: 409 },
    );
  }
  await mutateDatabase((d) => {
    d.professors = d.professors.filter(
      (p) => !(p.id === id && p.academiaId === tenantId),
    );
  });
  return NextResponse.json({ ok: true });
}
