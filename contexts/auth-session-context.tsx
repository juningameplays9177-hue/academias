"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { canAccessPath, isUltraAdmin } from "@/lib/rbac/access-control";
import type { RoleId } from "@/lib/rbac/roles";
import type { TenantMembership } from "@/lib/auth/session-cookie";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: RoleId;
  needsTenantSelection?: boolean;
  memberships?: TenantMembership[];
  canSwitchTenant?: boolean;
};

export type AuthTenant = {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
};

type AuthSessionContextValue = {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  isUltraAdmin: boolean;
  canSwitchTenant: boolean;
  canAccess: (pathname: string) => boolean;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as {
        user: AuthUser | null;
        tenant: AuthTenant | null;
      };
      setUser(data.user);
      setTenant(data.tenant);
    } catch {
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }, []);

  const isUltra = useMemo(
    () => (user ? isUltraAdmin(user.role) : false),
    [user],
  );

  const canAccess = useCallback(
    (pathname: string) => {
      if (!user) return false;
      return canAccessPath(user.role, pathname);
    },
    [user],
  );

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      user,
      tenant,
      loading,
      refresh,
      logout,
      isUltraAdmin: isUltra,
      canSwitchTenant: Boolean(user?.canSwitchTenant),
      canAccess,
    }),
    [user, tenant, loading, refresh, logout, isUltra, canAccess],
  );

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthSessionProvider");
  }
  return ctx;
}
