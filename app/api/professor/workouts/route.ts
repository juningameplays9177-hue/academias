import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import type { WorkoutTemplate } from "@/lib/db/types";
import { requireTenantProfessorContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session, db } = ctx;
  const workouts = db.workouts.filter(
    (w) =>
      w.academiaId === tenantId && w.criadoPorProfessorId === session.sub,
  );
  const students = db.students.filter((s) => s.academiaId === tenantId);
  return NextResponse.json({ workouts, students });
}

export async function POST(request: Request) {
  const ctx = await requireTenantProfessorContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session } = ctx;
  const body = (await request.json()) as Partial<WorkoutTemplate> & {
    alunoId?: string;
    replaceStudentWorkouts?: boolean;
  };

  const workout: WorkoutTemplate = {
    id: crypto.randomUUID(),
    academiaId: tenantId,
    nome: body.nome?.trim() || "Novo treino",
    descricao: body.descricao?.trim() || "",
    foco: body.foco?.trim() || "Geral",
    criadoPorProfessorId: session.sub,
  };

  await mutateDatabase((db) => {
    db.workouts.push(workout);
    if (body.alunoId && body.replaceStudentWorkouts) {
      const st = db.students.find(
        (s) =>
          s.id === body.alunoId &&
          s.academiaId === tenantId &&
          s.professorId === session.sub,
      );
      if (st) {
        st.treinos = [workout.nome];
      }
    }
  });

  return NextResponse.json({ workout });
}
