import { AlunoLayoutClient } from "@/components/aluno/aluno-layout-client";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AlunoLayoutClient>{children}</AlunoLayoutClient>;
}
