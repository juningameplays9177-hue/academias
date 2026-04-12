import { NextResponse } from "next/server";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { AttendanceRecord } from "@/lib/db/types";
import { requireTenantProfessorContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session, db } = ctx;
  const myStudentIds = new Set(
    db.students
      .filter(
        (s) =>
          s.academiaId === tenantId && s.professorId === session.sub,
      )
      .map((s) => s.id),
  );
  const rows = db.attendance.filter(
    (a) => a.academiaId === tenantId && myStudentIds.has(a.alunoId),
  );
  const students = db.students.filter((s) => s.academiaId === tenantId);
  return NextResponse.json({ attendance: rows, students });
}

export async function POST(request: Request) {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session } = ctx;
  const body = (await request.json()) as {
    alunoId?: string;
    aulaId?: string;
    presente?: boolean;
  };
  if (!body.alunoId || !body.aulaId) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const db = await readDatabase();
  const st = db.students.find(
    (s) =>
      s.id === body.alunoId &&
      s.academiaId === tenantId &&
      s.professorId === session.sub,
  );
  if (!st) {
    return NextResponse.json({ error: "Aluno inválido" }, { status: 400 });
  }

  const cls = db.classes.find(
    (c) => c.id === body.aulaId && c.academiaId === tenantId,
  );
  if (!cls) {
    return NextResponse.json({ error: "Aula inválida" }, { status: 400 });
  }

  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
    academiaId: tenantId,
    alunoId: body.alunoId,
    aulaId: body.aulaId,
    dataISO: new Date().toISOString(),
    presente: Boolean(body.presente),
  };

  await mutateDatabase((draft) => {
    draft.attendance.push(record);
  });

  return NextResponse.json({ attendance: record });
}
