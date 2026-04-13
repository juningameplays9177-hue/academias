import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import {
  TENANT_COOKIE_NAME,
  tenantCookieOptions,
} from "@/lib/auth/tenant-cookie";
import { readDatabase } from "@/lib/db/file-store";
import { recordToTenantAcademia } from "@/lib/tenant/branding";

const TENANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  const tenantCookieRaw =
    cookieStore.get(TENANT_COOKIE_NAME)?.value?.trim() || null;
  const db = await readDatabase();

  let academia =
    tenantCookieRaw && db.academias.length
      ? (db.academias.find((a) => a.id === tenantCookieRaw) ?? null)
      : null;

  if (!academia && tenantCookieRaw && db.academias.length) {
    const s = tenantCookieRaw.toLowerCase();
    academia = db.academias.find((a) => a.slug.toLowerCase() === s) ?? null;
    if (academia && academia.id !== tenantCookieRaw) {
      cookieStore.set(
        TENANT_COOKIE_NAME,
        academia.id,
        tenantCookieOptions(TENANT_COOKIE_MAX_AGE),
      );
    }
  }

  const tenant = academia
    ? recordToTenantAcademia(academia)
    : tenantCookieRaw
      ? {
          id: tenantCookieRaw,
          nome: "Academia",
          slug: tenantCookieRaw,
          endereco: null,
          telefone: null,
          instagram: null,
          email: null,
          logoUrl: null,
          corPrimaria: null,
          corPrimariaSecundaria: null,
          corPrimariaSuave: null,
          corFundo: null,
          corTexto: null,
          tagline: null,
          metaDescription: null,
          cidade: null,
          estado: null,
          googleMapsUrl: null,
        }
      : null;

  if (!session) {
    return NextResponse.json({ user: null, tenant });
  }

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
    tenant,
  });
}
