"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { canAccessPath, isUltraAdmin } from "@/lib/rbac/access-control";
import type { RoleId } from "@/lib/rbac/roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: RoleId;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: AuthUser | null };
      setUser(data.user);
    } catch {
      setUser(null);
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

  return {
    user,
    loading,
    refresh,
    logout,
    isUltraAdmin: isUltra,
    canAccess,
  };
}
