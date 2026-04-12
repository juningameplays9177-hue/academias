import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";
import type { StudentRecord } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const ctxReq = await requireTenantAdminContext();
  if (ctxReq instanceof NextResponse) return ctxReq;
  const { tenantId, db } = ctxReq;
  const { id } = await ctx.params;
  const student = db.students.find((s) => s.id === id && s.academiaId === tenantId);
  if (!student) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const plans = db.plans.filter((p) => p.academiaId === tenantId);
  const professors = db.professors.filter((p) => p.academiaId === tenantId);
  return NextResponse.json({
    student: studentWithoutPassword(student),
    plans,
    professors,
  });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const ctxReq = await requireTenantAdminContext();
  if (ctxReq instanceof NextResponse) return ctxReq;
  const { tenantId, db } = ctxReq;
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<StudentRecord>;

  const idx = db.students.findIndex((s) => s.id === id && s.academiaId === tenantId);
  if (idx === -1) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const current = db.students[idx];
  const nextEmail = patch.email?.trim().toLowerCase() ?? current.email;
  if (nextEmail !== current.email.toLowerCase()) {
    const dup = db.students.some(
      (s) =>
        s.id !== id &&
        s.academiaId === tenantId &&
        s.email.toLowerCase() === nextEmail,
    );
    if (dup) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }
  }

  const updated: StudentRecord = {
    ...current,
    ...patch,
    academiaId: tenantId,
    email: nextEmail,
    nome: patch.nome?.trim() ?? current.nome,
    telefone: patch.telefone?.trim() ?? current.telefone,
    permissoes: {
      ...current.permissoes,
      ...patch.permissoes,
    },
    treinos: patch.treinos ?? current.treinos,
    avisoPainel:
      patch.avisoPainel !== undefined ? patch.avisoPainel : current.avisoPainel,
  };

  await mutateDatabase((draft) => {
    const i = draft.students.findIndex((s) => s.id === id && s.academiaId === tenantId);
    if (i !== -1) draft.students[i] = updated;
  });

  return NextResponse.json({ student: studentWithoutPassword(updated) });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const ctxReq = await requireTenantAdminContext();
  if (ctxReq instanceof NextResponse) return ctxReq;
  const { tenantId } = ctxReq;
  const { id } = await ctx.params;
  await mutateDatabase((db) => {
    db.students = db.students.filter(
      (s) => !(s.id === id && s.academiaId === tenantId),
    );
    db.attendance = db.attendance.filter(
      (a) => !(a.alunoId === id && a.academiaId === tenantId),
    );
  });
  return NextResponse.json({ ok: true });
}
