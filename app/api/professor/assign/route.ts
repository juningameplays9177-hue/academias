import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as {
    alunoId?: string;
    treinos?: string[];
  };
  if (!body.alunoId || !Array.isArray(body.treinos)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const db = await readDatabase();
  const st = db.students.find((s) => s.id === body.alunoId);
  if (!st || st.professorId !== session.sub) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  await mutateDatabase((draft) => {
    const s = draft.students.find((x) => x.id === body.alunoId);
    if (s) s.treinos = body.treinos!;
  });

  return NextResponse.json({ ok: true });
}
