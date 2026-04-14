import { NextResponse } from "next/server";

export const maxDuration = 60;
import { studentWithoutPassword } from "@/lib/db/student-public";
import { requireTenantAlunoContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantAlunoContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session, db } = ctx;

  const student = db.students.find(
    (s) => s.id === session.sub && s.academiaId === tenantId,
  );
  if (!student) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const plan = db.plans.find(
    (p) => p.id === student.planoId && p.academiaId === tenantId,
  );
  const professor = student.professorId
    ? db.professors.find(
        (p) => p.id === student.professorId && p.academiaId === tenantId,
      )
    : null;

  const notices = db.notices.filter(
    (n) =>
      n.academiaId === tenantId &&
      (n.destino === "todos" || n.destino === "alunos"),
  );

  const classes = db.classes.filter((c) => c.academiaId === tenantId);

  return NextResponse.json({
    student: studentWithoutPassword(student),
    plan,
    professor,
    notices,
    classes,
  });
}
