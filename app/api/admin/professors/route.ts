import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import type { ProfessorRecord } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, db } = ctx;
  return NextResponse.json({
    professors: db.professors.filter((p) => p.academiaId === tenantId),
  });
}

export async function POST(request: Request) {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, db } = ctx;
  const body = (await request.json()) as Partial<ProfessorRecord>;
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
  }
  if (
    db.professors.some(
      (p) => p.email.toLowerCase() === email && p.academiaId === tenantId,
    ) ||
    db.students.some(
      (s) => s.email.toLowerCase() === email && s.academiaId === tenantId,
    )
  ) {
    return NextResponse.json({ error: "E-mail já usado nesta academia" }, { status: 409 });
  }
  const prof: ProfessorRecord = {
    id: crypto.randomUUID(),
    academiaId: tenantId,
    nome: body.nome?.trim() || "Novo professor",
    email,
    especialidade: body.especialidade?.trim() || "",
    telefone: body.telefone?.trim() || "",
  };
  await mutateDatabase((d) => {
    d.professors.push(prof);
  });
  return NextResponse.json({ professor: prof });
}
