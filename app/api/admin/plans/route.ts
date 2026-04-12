import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { PlanRecord } from "@/lib/db/types";

export async function GET() {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  return NextResponse.json({ plans: db.plans });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<PlanRecord>;
  const plan: PlanRecord = {
    id: crypto.randomUUID(),
    nome: body.nome?.trim() || "Novo plano",
    precoMensal: Number(body.precoMensal) || 0,
    beneficios: Array.isArray(body.beneficios) ? body.beneficios : [],
    destaque: Boolean(body.destaque),
  };
  await mutateDatabase((db) => {
    db.plans.push(plan);
  });
  return NextResponse.json({ plan });
}
