import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { readDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== "aluno") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const db = await readDatabase();
  const student = db.students.find(
    (s) => s.id === session.sub || s.email.toLowerCase() === session.email.toLowerCase(),
  );
  if (!student) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const plan = db.plans.find((p) => p.id === student.planoId);
  const professor = student.professorId
    ? db.professors.find((p) => p.id === student.professorId)
    : null;

  const notices = db.notices.filter(
    (n) => n.destino === "todos" || n.destino === "alunos",
  );

  const classes = db.classes;

  return NextResponse.json({
    student: studentWithoutPassword(student),
    plan,
    professor,
    notices,
    classes,
  });
}
