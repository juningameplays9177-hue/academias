import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { AuthStaffStatus } from "@/lib/db/types";
import { isRoleId } from "@/lib/rbac/roles";
import type { RoleId } from "@/lib/rbac/roles";
import {
  assertNotLastUltraRemoval,
  assertOnlyUltraModifiesUltra,
  assertRoleChangeKeepsUltra,
} from "@/lib/ultra/staff-rules";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await request.json()) as {
    name?: string;
    role?: RoleId;
    status?: AuthStaffStatus;
    newPassword?: string;
  };

  const db = await readDatabase();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  const target = db.users[idx];

  try {
    assertOnlyUltraModifiesUltra(session.role as RoleId, target);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Negado" },
      { status: 403 },
    );
  }

  if (body.role !== undefined) {
    if (!isRoleId(body.role) || (body.role !== "admin" && body.role !== "ultra_admin")) {
      return NextResponse.json({ error: "Role inválida." }, { status: 400 });
    }
    try {
      assertRoleChangeKeepsUltra(db.users, id, body.role);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Negado" },
        { status: 400 },
      );
    }
  }

  if (body.newPassword !== undefined && body.newPassword.length > 0 && body.newPassword.length < 6) {
    return NextResponse.json({ error: "Senha mínima de 6 caracteres." }, { status: 400 });
  }

  if (
    body.status !== undefined &&
    body.status !== "ativo" &&
    body.status !== "bloqueado"
  ) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  await mutateDatabase((draft) => {
    const u = draft.users.find((x) => x.id === id);
    if (!u) return;
    if (body.name !== undefined) u.name = body.name.trim() || u.name;
    if (body.role !== undefined) u.role = body.role;
    if (body.status !== undefined) {
      u.status = body.status;
    }
    if (body.newPassword !== undefined && body.newPassword.length >= 6) {
      u.password = body.newPassword;
    }
  });

  const fresh = (await readDatabase()).users.find((u) => u.id === id)!;
  const { password, ...safe } = fresh;
  void password;
  return NextResponse.json({ ok: true, user: safe });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let confirmPhrase = "";
  try {
    const j = (await request.json()) as { confirmPhrase?: string };
    confirmPhrase = j.confirmPhrase ?? "";
  } catch {
    return NextResponse.json({ error: "Envie JSON com confirmPhrase." }, { status: 400 });
  }
  if (confirmPhrase !== "DELETAR") {
    return NextResponse.json(
      { error: 'Confirmação inválida. Envie confirmPhrase exatamente: "DELETAR".' },
      { status: 400 },
    );
  }

  if (id === session.sub) {
    return NextResponse.json({ error: "Você não pode excluir a própria sessão." }, { status: 400 });
  }

  const db = await readDatabase();
  const target = db.users.find((u) => u.id === id);
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  try {
    assertNotLastUltraRemoval(db.users, target);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Negado" },
      { status: 400 },
    );
  }

  await mutateDatabase((draft) => {
    draft.users = draft.users.filter((u) => u.id !== id);
  });

  return NextResponse.json({ ok: true });
}
