import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { readDatabase } from "@/lib/db/file-store";

export async function GET() {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const db = await readDatabase();
  const alunosAtivos = db.students.filter((s) => s.status === "ativo").length;
  const faturamento = db.students.reduce((acc, s) => {
    const plan = db.plans.find((p) => p.id === s.planoId);
    return acc + (plan?.precoMensal ?? 0);
  }, 0);

  const planosPorNome = db.plans.map((p) => ({
    nome: p.nome,
    quantidade: db.students.filter((s) => s.planoId === p.id).length,
  }));

  return NextResponse.json({
    alunosTotal: db.students.length,
    alunosAtivos,
    professores: db.professors.length,
    faturamentoMensalEstimado: Math.round(faturamento * 100) / 100,
    planosPorNome,
    avisosRecentes: db.notices.slice(0, 4),
  });
}
