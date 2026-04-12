import type { RoleId } from "@/lib/rbac/roles";
import { isRoleId } from "@/lib/rbac/roles";

export const SESSION_COOKIE_NAME = "beirariofit_session";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: RoleId;
  exp: number;
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
    return data;
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
}): SessionPayload {
  const ttlMs = input.ttlMs ?? 1000 * 60 * 60 * 24 * 7;
  return {
    sub: input.sub,
    email: input.email,
    name: input.name,
    role: input.role,
    exp: Date.now() + ttlMs,
  };
}
