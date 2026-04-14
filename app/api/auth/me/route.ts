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
import { readPlatformRegistryPublic } from "@/lib/db/file-store";
import { isRoleId } from "@/lib/rbac/roles";
import { recordToTenantAcademia } from "@/lib/tenant/branding";

const TENANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  const tenantCookieRaw =
    cookieStore.get(TENANT_COOKIE_NAME)?.value?.trim() || null;
  const platform = await readPlatformRegistryPublic();
  const memberships = session?.memberships ?? [];
  const userRole = session?.role ?? "";
  const canUseAnyTenant = isRoleId(userRole) && userRole === "ultra_admin";

  const tenantAllowed = (tenantId: string) => {
    if (canUseAnyTenant) return true;
    return memberships.some((m) => m.academiaId === tenantId);
  };

  let academia =
    tenantCookieRaw && platform.academias.length
      ? (platform.academias.find((a) => a.id === tenantCookieRaw) ?? null)
      : null;

  if (!academia && tenantCookieRaw && platform.academias.length) {
    const s = tenantCookieRaw.toLowerCase();
    academia = platform.academias.find((a) => a.slug.toLowerCase() === s) ?? null;
    if (academia && academia.id !== tenantCookieRaw) {
      cookieStore.set(
        TENANT_COOKIE_NAME,
        academia.id,
        tenantCookieOptions(TENANT_COOKIE_MAX_AGE),
      );
    }
  }

  if (academia && !tenantAllowed(academia.id)) {
    academia = null;
  }

  const tenantCookieVisible =
    tenantCookieRaw &&
    (canUseAnyTenant ||
      memberships.some(
        (m) =>
          m.academiaId === tenantCookieRaw ||
          m.slug.toLowerCase() === tenantCookieRaw.toLowerCase(),
      ));

  const tenant = academia
    ? recordToTenantAcademia(academia)
    : tenantCookieVisible
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
      memberships,
      canSwitchTenant: memberships.length > 1,
    },
    tenant,
  });
}
