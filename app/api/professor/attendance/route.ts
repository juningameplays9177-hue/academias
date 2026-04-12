import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { AttendanceRecord } from "@/lib/db/types";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  const myStudentIds = new Set(
    db.students.filter((s) => s.professorId === session.sub).map((s) => s.id),
  );
  const rows = db.attendance.filter((a) => myStudentIds.has(a.alunoId));
  return NextResponse.json({ attendance: rows, students: db.students });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as {
    alunoId?: string;
    aulaId?: string;
    presente?: boolean;
  };
  if (!body.alunoId || !body.aulaId) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const db = await readDatabase();
  const st = db.students.find((s) => s.id === body.alunoId);
  if (!st || st.professorId !== session.sub) {
    return NextResponse.json({ error: "Aluno inválido" }, { status: 400 });
  }

  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
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
