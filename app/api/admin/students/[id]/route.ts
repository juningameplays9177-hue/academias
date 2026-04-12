import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";
import type { StudentRecord } from "@/lib/db/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = await readDatabase();
  const student = db.students.find((s) => s.id === id);
  if (!student) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json({
    student: studentWithoutPassword(student),
    plans: db.plans,
    professors: db.professors,
  });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<StudentRecord>;

  const db = await readDatabase();
  const idx = db.students.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const current = db.students[idx];
  const nextEmail = patch.email?.trim().toLowerCase() ?? current.email;
  if (nextEmail !== current.email.toLowerCase()) {
    const dup = db.students.some(
      (s) => s.id !== id && s.email.toLowerCase() === nextEmail,
    );
    if (dup) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }
  }

  const updated: StudentRecord = {
    ...current,
    ...patch,
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
    const i = draft.students.findIndex((s) => s.id === id);
    if (i !== -1) draft.students[i] = updated;
  });

  return NextResponse.json({ student: studentWithoutPassword(updated) });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await mutateDatabase((db) => {
    db.students = db.students.filter((s) => s.id !== id);
    db.attendance = db.attendance.filter((a) => a.alunoId !== id);
  });
  return NextResponse.json({ ok: true });
}
