"use client";

import {
  faChartPie,
  faSchool,
  faSliders,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { DashboardShell } from "@/components/shells/dashboard-shell";

const NAV = [
  { href: "/ultra-admin", label: "Contas", icon: faUsers },
  { href: "/ultra-admin/academias", label: "Academias", icon: faSchool },
  {
    href: "/ultra-admin/plataforma",
    label: "Plataforma",
    icon: faSliders,
  },
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
      basePath="/ultra-admin"
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
