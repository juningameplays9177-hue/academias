/** Cookie httpOnly separado da identidade — escopo multi-tenant (academia atual). */
export const TENANT_COOKIE_NAME = "beirariofit_tenant";

export function tenantCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  };
}
