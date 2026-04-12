import { NextResponse } from "next/server";
import { mutateDatabase } from "@/lib/db/file-store";
import type { NoticeRecord, NoticeTarget } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";

export async function GET() {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, db } = ctx;
  return NextResponse.json({
    notices: db.notices.filter((n) => n.academiaId === tenantId),
  });
}

export async function POST(request: Request) {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const { tenantId, session } = ctx;
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
    academiaId: tenantId,
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
