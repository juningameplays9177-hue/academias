"use client";

import { useMemo } from "react";
import {
  faBell,
  faChartPie,
  faCreditCard,
  faShieldHalved,
  faUserGraduate,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { DashboardShell } from "@/components/shells/dashboard-shell";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: faChartPie },
  { href: "/admin/alunos", label: "Alunos", icon: faUserGraduate },
  { href: "/admin/planos", label: "Planos", icon: faCreditCard },
  { href: "/admin/professores", label: "Professores", icon: faUserTie },
  { href: "/admin/avisos", label: "Avisos", icon: faBell },
];

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const prependNav = useMemo(
    () =>
      user?.role === "ultra_admin"
        ? [{ href: "/ultra-admin", label: "Ultra", icon: faShieldHalved }]
        : [],
    [user?.role],
  );

  return (
    <DashboardShell
      title="Administração"
      subtitle="Admin"
      basePath="/admin"
      prependNav={prependNav}
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
