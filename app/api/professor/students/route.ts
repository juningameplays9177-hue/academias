import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { readDatabase } from "@/lib/db/file-store";
import { studentForProfessorList } from "@/lib/db/student-public";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  const mine = db.students.filter((s) => s.professorId === session.sub);
  return NextResponse.json({
    students: mine.map(studentForProfessorList),
    plans: db.plans,
    allStudents: db.students.map(studentForProfessorList),
  });
}
