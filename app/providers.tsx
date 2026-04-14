"use client";

import { AuthSessionProvider } from "@/contexts/auth-session-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import { TenantHeadEffects } from "@/components/tenant/tenant-head-effects";

/**
 * Sessão + efeitos globais da unidade (título, meta, favicon, variáveis de marca).
 * Claro/escuro: `useAppearanceTheme` ou `useTheme` em `@/contexts/theme-context`.
 * Marca da academia: `useTenantTheme` em `@/hooks/use-tenant-theme` (e `useTenant`).
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <TenantHeadEffects />
      {children}
    </AuthSessionProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TenantProvider>{children}</TenantProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
