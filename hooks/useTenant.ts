"use client";

import { useAuth } from "@/hooks/useAuth";

/**
 * Escopo da academia atual (cookie httpOnly + metadados via /api/auth/me).
 */
export function useTenant() {
  const { tenant, loading, refresh, user, canSwitchTenant } = useAuth();
  return {
    tenant,
    loading,
    refresh,
    needsSelection: Boolean(user?.needsTenantSelection),
    canSwitchTenant,
  };
}
