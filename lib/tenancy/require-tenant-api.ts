import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { assertAdminApiSession } from "@/lib/auth/require-admin-api";
import type { SessionPayload } from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME } from "@/lib/auth/tenant-cookie";
import {
  readDatabaseScopeTenant,
  readPlatformRegistry,
} from "@/lib/db/file-store";
import type { AppDatabase } from "@/lib/db/types";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import { assertTenantScope } from "@/lib/tenancy/principal-in-tenant";
import { resolveTenantCookieRaw } from "@/lib/tenancy/tenant-cookie-resolve";

export type TenantAdminContext = {
  session: SessionPayload;
  tenantId: string;
  db: AppDatabase;
};

export async function requireTenantAdminContext():
  Promise<TenantAdminContext | NextResponse> {
  const session = await getServerSession();
  if (!assertAdminApiSession(session)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const jar = await cookies();
  const tenantRaw = jar.get(TENANT_COOKIE_NAME)?.value?.trim();
  if (!tenantRaw) {
    return NextResponse.json(
      { error: "Academia não selecionada. Escolha uma unidade." },
      { status: 400 },
    );
  }
  const platform = await readPlatformRegistry();
  const tenantId =
    resolveTenantCookieRaw(platform.academias, tenantRaw) ?? tenantRaw;
  if (!platform.academias.some((a) => a.id === tenantId)) {
    return NextResponse.json(
      { error: "Unidade inválida no cookie. Selecione a academia novamente." },
      { status: 400 },
    );
  }
  const db = await readDatabaseScopeTenant(platform, tenantId);
  if (!assertTenantScope(db, session, tenantId)) {
    return NextResponse.json(
      { error: "Sessão não autorizada para esta academia." },
      { status: 403 },
    );
  }
  if (
    session.role !== "ultra_admin" &&
    isAcademiaPlataformaDesligada(db, tenantId)
  ) {
    return NextResponse.json(
      {
        error:
          "Esta unidade está temporariamente suspensa pelo Ultra Admin. Tente outra academia.",
      },
      { status: 503 },
    );
  }
  return { session, tenantId, db };
}

export type TenantProfessorContext = {
  session: SessionPayload;
  tenantId: string;
  db: AppDatabase;
};

export async function requireTenantProfessorContext():
  Promise<TenantProfessorContext | NextResponse> {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const jar = await cookies();
  const tenantRaw = jar.get(TENANT_COOKIE_NAME)?.value?.trim();
  if (!tenantRaw) {
    return NextResponse.json(
      { error: "Academia não selecionada." },
      { status: 400 },
    );
  }
  const platform = await readPlatformRegistry();
  const tenantId =
    resolveTenantCookieRaw(platform.academias, tenantRaw) ?? tenantRaw;
  if (!platform.academias.some((a) => a.id === tenantId)) {
    return NextResponse.json(
      { error: "Unidade inválida no cookie. Selecione a academia novamente." },
      { status: 400 },
    );
  }
  const db = await readDatabaseScopeTenant(platform, tenantId);
  if (!assertTenantScope(db, session, tenantId)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  if (isAcademiaPlataformaDesligada(db, tenantId)) {
    return NextResponse.json(
      {
        error:
          "Esta unidade está temporariamente suspensa pelo Ultra Admin. Tente outra academia.",
      },
      { status: 503 },
    );
  }
  return { session, tenantId, db };
}

export type TenantAlunoContext = {
  session: SessionPayload;
  tenantId: string;
  db: AppDatabase;
};

export async function requireTenantAlunoContext():
  Promise<TenantAlunoContext | NextResponse> {
  const session = await getServerSession();
  if (!session || session.role !== "aluno") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const jar = await cookies();
  const tenantRaw = jar.get(TENANT_COOKIE_NAME)?.value?.trim();
  if (!tenantRaw) {
    return NextResponse.json(
      { error: "Academia não selecionada." },
      { status: 400 },
    );
  }
  const platform = await readPlatformRegistry();
  const tenantId =
    resolveTenantCookieRaw(platform.academias, tenantRaw) ?? tenantRaw;
  if (!platform.academias.some((a) => a.id === tenantId)) {
    return NextResponse.json(
      { error: "Unidade inválida no cookie. Selecione a academia novamente." },
      { status: 400 },
    );
  }
  const db = await readDatabaseScopeTenant(platform, tenantId);
  if (!assertTenantScope(db, session, tenantId)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  if (isAcademiaPlataformaDesligada(db, tenantId)) {
    return NextResponse.json(
      {
        error:
          "Esta unidade está temporariamente suspensa pelo Ultra Admin. Tente outra academia.",
      },
      { status: 503 },
    );
  }
  return { session, tenantId, db };
}
