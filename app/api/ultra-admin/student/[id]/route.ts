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
  const body = (await request.json()) as {
    status?: StudentStatus;
    academiaId?: string;
  };

  const wantsStatus = body.status !== undefined;
  const wantsAcademia = body.academiaId !== undefined;
  if (!wantsStatus && !wantsAcademia) {
    return NextResponse.json(
      { error: "Informe status e/ou academiaId." },
      { status: 400 },
    );
  }
  if (wantsStatus && (!body.status || !ALLOWED.includes(body.status))) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const db = await readDatabase();
  const current = db.students.find((s) => s.id === id);
  if (!current) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  let nextAcademiaId = current.academiaId;
  if (wantsAcademia) {
    const academiaId = body.academiaId?.trim() ?? "";
    if (!academiaId) {
      return NextResponse.json({ error: "academiaId inválido." }, { status: 400 });
    }
    const target = db.academias.find((a) => a.id === academiaId) ?? null;
    if (!target || target.status !== "ativo") {
      return NextResponse.json(
        { error: "Academia destino inválida ou inativa." },
        { status: 400 },
      );
    }
    nextAcademiaId = target.id;
  }

  const movingAcademia = nextAcademiaId !== current.academiaId;
  const targetPlans = db.plans.filter((p) => p.academiaId === nextAcademiaId);
  if (movingAcademia && targetPlans.length === 0) {
    return NextResponse.json(
      {
        error:
          "A academia destino não possui planos. Configure um plano antes da transferência.",
      },
      { status: 400 },
    );
  }

  await mutateDatabase((draft) => {
    const s = draft.students.find((x) => x.id === id);
    if (!s) return;
    if (wantsStatus && body.status) {
      s.status = body.status;
    }
    if (movingAcademia) {
      s.academiaId = nextAcademiaId;
      const planStillValid = draft.plans.some(
        (p) => p.id === s.planoId && p.academiaId === nextAcademiaId,
      );
      if (!planStillValid) {
        const targetPlan = draft.plans.find((p) => p.academiaId === nextAcademiaId);
        s.planoId = targetPlan?.id ?? s.planoId;
      }
      const professorStillValid =
        s.professorId &&
        draft.professors.some(
          (p) => p.id === s.professorId && p.academiaId === nextAcademiaId,
        );
      if (!professorStillValid) {
        s.professorId = null;
      }
    }
  });

  const st = (await readDatabase()).students.find((s) => s.id === id);
  if (!st) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, student: studentWithoutPassword(st) });
}
