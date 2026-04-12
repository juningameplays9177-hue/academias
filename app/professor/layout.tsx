import { ProfessorLayoutClient } from "@/components/professor/professor-layout-client";

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfessorLayoutClient>{children}</ProfessorLayoutClient>;
}
