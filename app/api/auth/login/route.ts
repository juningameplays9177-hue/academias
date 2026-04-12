import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  createSessionPayload,
  encodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { resolveLogin } from "@/lib/auth/resolve-user";
import { readDatabase } from "@/lib/db/file-store";
import { isSitePublicOff } from "@/lib/platform/site-public-off";
import type { RoleId } from "@/lib/rbac/roles";

function dashboardPath(role: RoleId): string {
  if (role === "ultra_admin") return "/ultra";
  if (role === "admin") return "/admin";
  if (role === "professor") return "/professor";
  return "/aluno";
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };
  const email = body.email ?? "";
  const password = body.password ?? "";

  const db = await readDatabase();
  const user = resolveLogin(db, email, password);
  if (!user) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  if (isSitePublicOff(db) && user.role !== "ultra_admin") {
    return NextResponse.json(
      {
        error:
          "Site em manutenção. Neste momento só o Ultra Admin pode entrar na plataforma.",
      },
      { status: 503 },
    );
  }

  const payload = createSessionPayload({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const token = encodeSessionPayload(payload);
  const res = NextResponse.json({
    ok: true,
    redirectTo: dashboardPath(user.role),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });

  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
