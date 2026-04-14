"use client";

import { useMemo } from "react";
import { useTenant } from "@/hooks/useTenant";
import { tenantTheme, type TenantTheme } from "@/lib/tenant/theme";

/**
 * Tema dinâmico da unidade (cores definidas no Ultra Admin + fallbacks).
 * Integra com `useTenant()`; variáveis CSS são aplicadas em `TenantHeadEffects`.
 *
 * Para claro/escuro global da UI, use `useAppearanceTheme` (ou o alias `useTheme`) de `@/contexts/theme-context`.
 */
export function useTenantTheme(): {
  academia: ReturnType<typeof useTenant>["academia"];
  tenant: ReturnType<typeof useTenant>["tenant"];
  theme: TenantTheme;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { academia, tenant, loading, refresh } = useTenant();
  const theme = useMemo(() => tenantTheme(academia), [academia]);
  return { academia, tenant, theme, loading, refresh };
}
