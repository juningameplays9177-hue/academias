import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";
import type { StudentRecord, StudentStatus } from "@/lib/db/types";

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const status = searchParams.get("status") as StudentStatus | "all" | null;

  const db = await readDatabase();
  let list = db.students;
  if (q) {
    list = list.filter(
      (s) =>
        s.nome.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }
  if (status && status !== "all") {
    list = list.filter((s) => s.status === status);
  }
  return NextResponse.json({
    students: list.map(studentWithoutPassword),
    plans: db.plans,
    professors: db.professors,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<StudentRecord>;
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
  }

  const dbBefore = await readDatabase();
  if (dbBefore.students.some((s) => s.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const novo: StudentRecord = {
    id: crypto.randomUUID(),
    nome: body.nome?.trim() || "Novo aluno",
    email,
    telefone: body.telefone?.trim() || "",
    planoId: body.planoId || "plan-basico",
    status: body.status ?? "pendente",
    professorId: body.professorId ?? null,
    permissoes: {
      treino: body.permissoes?.treino ?? true,
      dieta: body.permissoes?.dieta ?? false,
      agenda: body.permissoes?.agenda ?? true,
      progresso: body.permissoes?.progresso ?? true,
      avaliacao: body.permissoes?.avaliacao ?? false,
    },
    treinos: body.treinos ?? [],
    avisoPainel: body.avisoPainel ?? "",
    progressoPct: body.progressoPct ?? 0,
    criadoEm: new Date().toISOString(),
  };

  await mutateDatabase((db) => {
    db.students.push(novo);
  });

  return NextResponse.json({ student: studentWithoutPassword(novo) });
}
