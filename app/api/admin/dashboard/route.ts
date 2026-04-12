import { NextResponse } from "next/server";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, db } = ctx;

  const students = db.students.filter((s) => s.academiaId === tenantId);
  const plans = db.plans.filter((p) => p.academiaId === tenantId);
  const professors = db.professors.filter((p) => p.academiaId === tenantId);
  const notices = db.notices.filter((n) => n.academiaId === tenantId);

  const alunosAtivos = students.filter((s) => s.status === "ativo").length;
  const faturamento = students.reduce((acc, s) => {
    const plan = plans.find((p) => p.id === s.planoId);
    return acc + (plan?.precoMensal ?? 0);
  }, 0);

  const planosPorNome = plans.map((p) => ({
    nome: p.nome,
    quantidade: students.filter((s) => s.planoId === p.id).length,
  }));

  return NextResponse.json({
    alunosTotal: students.length,
    alunosAtivos,
    professores: professors.length,
    faturamentoMensalEstimado: Math.round(faturamento * 100) / 100,
    planosPorNome,
    avisosRecentes: notices.slice(0, 4),
  });
}
