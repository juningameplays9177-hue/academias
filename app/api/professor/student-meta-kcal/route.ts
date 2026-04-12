import { NextResponse } from "next/server";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";
import { requireTenantProfessorContext } from "@/lib/tenancy/require-tenant-api";

const MIN_KCAL = 800;
const MAX_KCAL = 6000;

export async function POST(request: Request) {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session } = ctx;

  const body = (await request.json()) as {
    alunoId?: string;
    metaKcalDia?: number | null;
  };

  if (!body.alunoId || typeof body.alunoId !== "string") {
    return NextResponse.json({ error: "Informe o aluno." }, { status: 400 });
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

  if (body.metaKcalDia === null || body.metaKcalDia === undefined) {
    await mutateDatabase((draft) => {
      const s = draft.students.find(
        (x) =>
          x.id === body.alunoId &&
          x.academiaId === tenantId &&
          x.professorId === session.sub,
      );
      if (s) delete s.metaKcalDia;
    });
    const fresh = (await readDatabase()).students.find((s) => s.id === body.alunoId)!;
    return NextResponse.json({ ok: true, student: studentWithoutPassword(fresh) });
  }

  const n = Number(body.metaKcalDia);
  if (!Number.isFinite(n) || n < MIN_KCAL || n > MAX_KCAL) {
    return NextResponse.json(
      {
        error: `Meta inválida. Use um número entre ${MIN_KCAL} e ${MAX_KCAL} kcal/dia, ou envie null para limpar.`,
      },
      { status: 400 },
    );
  }

  const rounded = Math.round(n);

  await mutateDatabase((draft) => {
    const s = draft.students.find(
      (x) =>
        x.id === body.alunoId &&
        x.academiaId === tenantId &&
        x.professorId === session.sub,
    );
    if (s) s.metaKcalDia = rounded;
  });

  const fresh = (await readDatabase()).students.find((s) => s.id === body.alunoId)!;
  return NextResponse.json({ ok: true, student: studentWithoutPassword(fresh) });
}
