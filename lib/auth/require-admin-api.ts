import type { SessionPayload } from "@/lib/auth/session-cookie";
import { canUseAdminApi } from "@/lib/rbac/access-control";
import type { RoleId } from "@/lib/rbac/roles";

export function assertAdminApiSession(
  session: SessionPayload | null,
): session is SessionPayload {
  return !!(session && canUseAdminApi(session.role as RoleId));
}
