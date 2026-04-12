import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { WorkoutTemplate } from "@/lib/db/types";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  const workouts = db.workouts.filter(
    (w) => w.criadoPorProfessorId === session.sub,
  );
  return NextResponse.json({ workouts, students: db.students });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<WorkoutTemplate> & {
    alunoId?: string;
    /** substitui lista de treinos do aluno quando informado */
    replaceStudentWorkouts?: boolean;
  };

  const workout: WorkoutTemplate = {
    id: crypto.randomUUID(),
    nome: body.nome?.trim() || "Novo treino",
    descricao: body.descricao?.trim() || "",
    foco: body.foco?.trim() || "Geral",
    criadoPorProfessorId: session.sub,
  };

  await mutateDatabase((db) => {
    db.workouts.push(workout);
    if (body.alunoId && body.replaceStudentWorkouts) {
      const st = db.students.find((s) => s.id === body.alunoId);
      if (st && st.professorId === session.sub) {
        st.treinos = [workout.nome];
      }
    }
  });

  return NextResponse.json({ workout });
}
