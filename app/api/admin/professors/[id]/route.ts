import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { ProfessorRecord } from "@/lib/db/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<ProfessorRecord>;

  const db = await readDatabase();
  const idx = db.professors.findIndex((p) => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  const current = db.professors[idx];
  const nextEmail = patch.email?.trim().toLowerCase() ?? current.email;
  if (nextEmail !== current.email.toLowerCase()) {
    const clash =
      db.professors.some(
        (p) => p.id !== id && p.email.toLowerCase() === nextEmail,
      ) || db.students.some((s) => s.email.toLowerCase() === nextEmail);
    if (clash) {
      return NextResponse.json({ error: "E-mail já usado" }, { status: 409 });
    }
  }
  const updated: ProfessorRecord = {
    ...current,
    ...patch,
    email: nextEmail,
    nome: patch.nome?.trim() ?? current.nome,
  };
  await mutateDatabase((d) => {
    const i = d.professors.findIndex((p) => p.id === id);
    if (i !== -1) d.professors[i] = updated;
  });
  return NextResponse.json({ professor: updated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const db = await readDatabase();
  const inUse = db.students.some((s) => s.professorId === id);
  if (inUse) {
    return NextResponse.json(
      { error: "Professor com alunos vinculados." },
      { status: 409 },
    );
  }
  await mutateDatabase((d) => {
    d.professors = d.professors.filter((p) => p.id !== id);
  });
  return NextResponse.json({ ok: true });
}
