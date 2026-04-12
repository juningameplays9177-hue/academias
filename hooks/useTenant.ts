"use client";

import { useAuth } from "@/hooks/useAuth";
import type { TenantAcademia } from "@/lib/tenant/branding";

/**
 * Academia selecionada (cookie + `/api/auth/me`) e metadados para site e painéis.
 * `academia` é o mesmo objeto que `tenant` em `useAuth` — nome alinhado ao domínio SaaS.
 */
export function useTenant(): {
  academia: TenantAcademia | null;
  tenant: TenantAcademia | null;
  loading: boolean;
  refresh: () => Promise<void>;
  needsSelection: boolean;
  canSwitchTenant: boolean;
} {
  const { tenant, loading, refresh, user, canSwitchTenant } = useAuth();
  return {
    academia: tenant,
    tenant,
    loading,
    refresh,
    needsSelection: Boolean(user?.needsTenantSelection),
    canSwitchTenant,
  };
}
