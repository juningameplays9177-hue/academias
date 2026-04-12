"use client";

import {
  faCalendarDays,
  faClipboardCheck,
  faDumbbell,
  faHouse,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { DashboardShell } from "@/components/shells/dashboard-shell";

const NAV = [
  { href: "/professor", label: "Início", icon: faHouse },
  { href: "/professor/alunos", label: "Alunos", icon: faUsers },
  { href: "/professor/treinos", label: "Treinos", icon: faDumbbell },
  { href: "/professor/agenda", label: "Agenda", icon: faCalendarDays },
  { href: "/professor/presenca", label: "Presença", icon: faClipboardCheck },
];

export function ProfessorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      title="Equipe técnica"
      subtitle="Professor"
      basePath="/professor"
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
