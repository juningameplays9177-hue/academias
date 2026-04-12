import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";
import type { StudentStatus } from "@/lib/db/types";

type Ctx = { params: Promise<{ id: string }> };

const ALLOWED: StudentStatus[] = ["ativo", "bloqueado", "pendente", "inativo"];

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await request.json()) as { status?: StudentStatus };

  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  await mutateDatabase((draft) => {
    const s = draft.students.find((x) => x.id === id);
    if (s) s.status = body.status!;
  });

  const st = (await readDatabase()).students.find((s) => s.id === id);
  if (!st) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, student: studentWithoutPassword(st) });
}
