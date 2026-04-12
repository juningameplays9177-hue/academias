import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import { studentWithoutPassword } from "@/lib/db/student-public";
import type { StudentRecord, StudentStatus } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

export async function GET(request: Request) {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, db } = ctx;
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const status = searchParams.get("status") as StudentStatus | "all" | null;

  let list = db.students.filter((s) => s.academiaId === tenantId);
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
  const plans = db.plans.filter((p) => p.academiaId === tenantId);
  const professors = db.professors.filter((p) => p.academiaId === tenantId);
  return NextResponse.json({
    students: list.map(studentWithoutPassword),
    plans,
    professors,
  });
}

export async function POST(request: Request) {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, db } = ctx;
  const body = (await request.json()) as Partial<StudentRecord>;
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
  }

  if (
    db.students.some(
      (s) => s.email.toLowerCase() === email && s.academiaId === tenantId,
    )
  ) {
    return NextResponse.json({ error: "E-mail já cadastrado nesta academia." }, { status: 409 });
  }

  const novo: StudentRecord = {
    id: crypto.randomUUID(),
    academiaId: tenantId,
    nome: body.nome?.trim() || "Novo aluno",
    email,
    telefone: body.telefone?.trim() || "",
    planoId: body.planoId || db.plans.find((p) => p.academiaId === tenantId)?.id || "",
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

  if (!novo.planoId) {
    return NextResponse.json({ error: "Nenhum plano configurado para esta academia." }, { status: 400 });
  }

  await mutateDatabase((draft) => {
    draft.students.push(novo);
  });

  return NextResponse.json({ student: studentWithoutPassword(novo) });
}
