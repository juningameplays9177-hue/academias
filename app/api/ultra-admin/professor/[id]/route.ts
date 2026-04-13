import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await request.json()) as {
    contaBloqueada?: boolean;
    newPassword?: string;
  };

  const db = await readDatabase();
  const idx = db.professors.findIndex((p) => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });
  }

  if (body.newPassword !== undefined && body.newPassword.length > 0 && body.newPassword.length < 6) {
    return NextResponse.json({ error: "Senha mínima de 6 caracteres." }, { status: 400 });
  }

  await mutateDatabase((draft) => {
    const p = draft.professors.find((x) => x.id === id);
    if (!p) return;
    if (typeof body.contaBloqueada === "boolean") {
      p.contaBloqueada = body.contaBloqueada;
    }
    if (body.newPassword !== undefined) {
      if (body.newPassword.length >= 6) {
        p.senhaPlataforma = body.newPassword;
      }
    }
  });

  const fresh = (await readDatabase()).professors.find((p) => p.id === id)!;
  const { senhaPlataforma, ...safe } = fresh;
  void senhaPlataforma;
  return NextResponse.json({ ok: true, professor: safe });
}
