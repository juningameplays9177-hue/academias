import { NextResponse } from "next/server";
import { studentForProfessorList } from "@/lib/db/student-public";
import { requireTenantProfessorContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session, db } = ctx;
  const students = db.students.filter((s) => s.academiaId === tenantId);
  const mine = students.filter((s) => s.professorId === session.sub);
  const plans = db.plans.filter((p) => p.academiaId === tenantId);
  return NextResponse.json({
    students: mine.map(studentForProfessorList),
    plans,
    allStudents: students.map(studentForProfessorList),
  });
}
