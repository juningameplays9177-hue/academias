"use client";

import {
  faChartPie,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { DashboardShell } from "@/components/shells/dashboard-shell";

const NAV = [
  { href: "/ultra", label: "Contas", icon: faUsers },
  { href: "/admin", label: "Painel admin", icon: faChartPie },
];

export function UltraLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      title="Controle da plataforma"
      subtitle="Ultra Admin"
      basePath="/ultra"
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
