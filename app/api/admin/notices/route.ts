import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { NoticeRecord, NoticeTarget } from "@/lib/db/types";

export async function GET() {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  return NextResponse.json({ notices: db.notices });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as {
    titulo?: string;
    corpo?: string;
    destino?: NoticeTarget;
  };
  if (!body.titulo?.trim() || !body.corpo?.trim()) {
    return NextResponse.json({ error: "Título e corpo obrigatórios" }, { status: 400 });
  }
  const notice: NoticeRecord = {
    id: crypto.randomUUID(),
    titulo: body.titulo.trim(),
    corpo: body.corpo.trim(),
    destino: body.destino ?? "alunos",
    criadoEm: new Date().toISOString(),
    criadoPorUserId: session.sub,
  };
  await mutateDatabase((db) => {
    db.notices.unshift(notice);
  });
  return NextResponse.json({ notice });
}
