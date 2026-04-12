import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME } from "@/lib/auth/tenant-cookie";
import { readDatabase } from "@/lib/db/file-store";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  if (!session) {
    return NextResponse.json({ user: null, tenant: null });
  }

  const tenantId = cookieStore.get(TENANT_COOKIE_NAME)?.value ?? null;
  const db = await readDatabase();
  const academia =
    tenantId && db.academias
      ? db.academias.find((a) => a.id === tenantId) ?? null
      : null;

  return NextResponse.json({
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
      needsTenantSelection: Boolean(session.needsTenantSelection),
      memberships: session.memberships ?? [],
      canSwitchTenant: (session.memberships?.length ?? 0) > 1,
    },
    tenant: academia
      ? {
          id: academia.id,
          nome: academia.nome,
          slug: academia.slug,
          logoUrl: academia.logoUrl ?? null,
        }
      : tenantId
        ? { id: tenantId, nome: "Academia", slug: tenantId, logoUrl: null }
        : null,
  });
}
