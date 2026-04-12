import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { AuthUserRecord } from "@/lib/db/types";
import { isRoleId, type RoleId } from "@/lib/rbac/roles";
import { assertActorUltraForCreateUltra } from "@/lib/ultra/staff-rules";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: RoleId;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = body.role;

  if (name.length < 2 || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Nome, e-mail válido e senha (mín. 6) são obrigatórios." },
      { status: 400 },
    );
  }
  if (!role || !isRoleId(role) || (role !== "admin" && role !== "ultra_admin")) {
    return NextResponse.json(
      { error: "Role inválida. Staff aceita apenas admin ou ultra_admin." },
      { status: 400 },
    );
  }

  try {
    assertActorUltraForCreateUltra(session.role as RoleId, role);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Negado" },
      { status: 403 },
    );
  }

  const db = await readDatabase();
  if (
    db.users.some((u) => u.email.toLowerCase() === email) ||
    db.professors.some((p) => p.email.toLowerCase() === email) ||
    db.students.some((s) => s.email.toLowerCase() === email)
  ) {
    return NextResponse.json({ error: "E-mail já usado em outra conta." }, { status: 409 });
  }

  const novo: AuthUserRecord = {
    id: `usr-${crypto.randomUUID()}`,
    email,
    password,
    name,
    role,
    status: "ativo",
  };

  await mutateDatabase((draft) => {
    draft.users.push(novo);
  });

  const { password: _p, ...safe } = novo;
  return NextResponse.json({ ok: true, user: safe });
}
