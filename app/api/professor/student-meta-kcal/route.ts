import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";

const MIN_KCAL = 800;
const MAX_KCAL = 6000;

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    alunoId?: string;
    metaKcalDia?: number | null;
  };

  if (!body.alunoId || typeof body.alunoId !== "string") {
    return NextResponse.json({ error: "Informe o aluno." }, { status: 400 });
  }

  const db = await readDatabase();
  const st = db.students.find((s) => s.id === body.alunoId);
  if (!st || st.professorId !== session.sub) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  if (body.metaKcalDia === null || body.metaKcalDia === undefined) {
    await mutateDatabase((draft) => {
      const s = draft.students.find((x) => x.id === body.alunoId);
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
    const s = draft.students.find((x) => x.id === body.alunoId);
    if (s) s.metaKcalDia = rounded;
  });

  const fresh = (await readDatabase()).students.find((s) => s.id === body.alunoId)!;
  return NextResponse.json({ ok: true, student: studentWithoutPassword(fresh) });
}
