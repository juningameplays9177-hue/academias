import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { ProfessorRecord } from "@/lib/db/types";

export async function GET() {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  return NextResponse.json({ professors: db.professors });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<ProfessorRecord>;
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
  }
  const db = await readDatabase();
  if (
    db.professors.some((p) => p.email.toLowerCase() === email) ||
    db.students.some((s) => s.email.toLowerCase() === email)
  ) {
    return NextResponse.json({ error: "E-mail já usado" }, { status: 409 });
  }
  const prof: ProfessorRecord = {
    id: crypto.randomUUID(),
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
