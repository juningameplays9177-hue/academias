"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { StudentRecord } from "@/lib/db/types";

export function ProfessorHomeClient() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/professor/students", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { students: StudentRecord[] };
      setTotal(data.students.length);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Professor", href: "/professor" },
          { label: "Início" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Painel do professor</h1>
        <p className="mt-1 text-sm text-muted">
          Você vê só a galera que está sob sua coordenação — sem bisbilhotar o
          resto da unidade.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Alunos sob você</p>
          <p className="mt-2 text-3xl font-semibold">{total}</p>
          <p className="mt-1 text-xs text-muted">
            Contagem direta do arquivo — atualiza quando admin mexe vínculo.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-muted">Dica rápida</p>
          <p className="mt-2 text-sm text-muted">
            Marca presença no fim da aula, não no meio do aquecimento — aluno
            some pra buscar água e você fica com registro estranho.
          </p>
        </div>
      </div>
    </div>
  );
}
