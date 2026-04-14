import type { RoleId } from "@/lib/rbac/roles";
import { isRoleId } from "@/lib/rbac/roles";

export const SESSION_COOKIE_NAME = "beirariofit_session";

/** Membro de uma academia após login (permite troca de tenant sem nova senha). */
export type TenantMembership = {
  academiaId: string;
  principalId: string;
  role: RoleId;
  academiaNome: string;
  slug: string;
  /** Nome do perfil na unidade (aluno/prof/admin). */
  displayName?: string;
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: RoleId;
  exp: number;
  /** True até o usuário escolher a academia (multi-tenant). */
  needsTenantSelection?: boolean;
  /** Unidades onde o mesmo e-mail tem acesso (SaaS). */
  memberships?: TenantMembership[];
  /** Versão do payload para migrações leves. */
  v?: number;
};

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSessionPayload(payload: SessionPayload): string {
  return utf8ToBase64(JSON.stringify(payload));
}

export function decodeSessionPayload(token: string): SessionPayload | null {
  try {
    const json = base64ToUtf8(token);
    const data = JSON.parse(json) as SessionPayload;
    if (!data?.sub || !data?.role || !data?.exp) return null;
    if (!isRoleId(String(data.role))) return null;
    if (Date.now() > data.exp) return null;
    const nts = data.needsTenantSelection as unknown;
    const needsTenantSelection =
      nts === true || nts === "true" ? true : undefined;
    return {
      ...data,
      v: data.v ?? 2,
      needsTenantSelection,
    };
  } catch {
    return null;
  }
}

export function createSessionPayload(input: {
  sub: string;
  email: string;
  name: string;
  role: RoleId;
  ttlMs?: number;
  needsTenantSelection?: boolean;
  memberships?: TenantMembership[];
}): SessionPayload {
  const ttlMs = input.ttlMs ?? 1000 * 60 * 60 * 24 * 7;
  return {
    sub: input.sub,
    email: input.email,
    name: input.name,
    role: input.role,
    exp: Date.now() + ttlMs,
    v: 2,
    needsTenantSelection: input.needsTenantSelection,
    memberships: input.memberships,
  };
}
