"use client";

import {
  faBowlFood,
  faCalendarDays,
  faChartLine,
  faClipboardList,
  faHouse,
  faWeightScale,
} from "@fortawesome/free-solid-svg-icons";
import { DashboardShell } from "@/components/shells/dashboard-shell";

const NAV = [
  { href: "/aluno", label: "Visão geral", icon: faHouse },
  { href: "/aluno/treinos", label: "Treinos", icon: faClipboardList },
  { href: "/aluno/agenda", label: "Agenda", icon: faCalendarDays },
  { href: "/aluno/progresso", label: "Progresso", icon: faChartLine },
  { href: "/aluno/nutricao", label: "Nutrição", icon: faBowlFood },
  { href: "/aluno/balanca", label: "Balança (kcal)", icon: faWeightScale },
];

export function AlunoLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      title="Minha conta"
      subtitle="Aluno"
      basePath="/aluno"
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
