"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutTemplate } from "@/lib/db/types";
import { useToast } from "@/contexts/toast-context";

export function ProfessorWorkoutsClient() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState<WorkoutTemplate[]>([]);
  const [nome, setNome] = useState("");
  const [foco, setFoco] = useState("");
  const [descricao, setDescricao] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/professor/workouts", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { workouts: WorkoutTemplate[] };
    setRows(data.workouts);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    const res = await fetch("/api/professor/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, foco, descricao }),
    });
    if (!res.ok) {
      pushToast({ type: "error", title: "Não criou treino" });
      return;
    }
    pushToast({ type: "success", title: "Treino salvo no acervo" });
    setNome("");
    setFoco("");
    setDescricao("");
    await load();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Professor", href: "/professor" },
          { label: "Treinos" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Modelos de treino</h1>
        <p className="mt-1 text-sm text-muted">
          Templates pra reutilizar — atribuição pros alunos continua na aba
          &quot;Alunos&quot;.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input label="Foco" value={foco} onChange={(e) => setFoco(e.target.value)} />
          <div className="flex items-end">
            <Button type="button" className="w-full" onClick={() => void create()}>
              Criar modelo
            </Button>
          </div>
        </div>
        <label className="mt-3 block text-xs text-muted">
          Descrição
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((w) => (
          <article key={w.id} className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-semibold">{w.nome}</h2>
            <p className="text-xs text-muted">{w.foco}</p>
            <p className="mt-2 text-sm text-muted">{w.descricao}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
