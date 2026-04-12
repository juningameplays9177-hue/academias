import { NextResponse } from "next/server";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { requireTenantProfessorContext } from "@/lib/tenancy/require-tenant-api";

export async function POST(request: Request) {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session } = ctx;
  const body = (await request.json()) as {
    alunoId?: string;
    treinos?: string[];
  };
  if (!body.alunoId || !Array.isArray(body.treinos)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const db = await readDatabase();
  const st = db.students.find(
    (s) =>
      s.id === body.alunoId &&
      s.academiaId === tenantId &&
      s.professorId === session.sub,
  );
  if (!st) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  await mutateDatabase((draft) => {
    const s = draft.students.find(
      (x) =>
        x.id === body.alunoId &&
        x.academiaId === tenantId &&
        x.professorId === session.sub,
    );
    if (s) s.treinos = body.treinos!;
  });

  return NextResponse.json({ ok: true });
}
