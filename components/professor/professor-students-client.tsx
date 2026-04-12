"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import type { PlanRecord, StudentRecord } from "@/lib/db/types";
import { useToast } from "@/contexts/toast-context";

export function ProfessorStudentsClient() {
  const { pushToast } = useToast();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [kcalDrafts, setKcalDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/professor/students", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      students: StudentRecord[];
      plans: PlanRecord[];
    };
    setStudents(data.students);
    setPlans(data.plans);
    const map: Record<string, string> = {};
    const kcalMap: Record<string, string> = {};
    data.students.forEach((s) => {
      map[s.id] = s.treinos.join("\n");
      kcalMap[s.id] = s.metaKcalDia != null ? String(s.metaKcalDia) : "";
    });
    setDrafts(map);
    setKcalDrafts(kcalMap);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveTreinos(alunoId: string) {
    const treinos = (drafts[alunoId] ?? "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch("/api/professor/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId, treinos }),
    });
    if (!res.ok) {
      pushToast({ type: "error", title: "Não salvou treinos" });
      return;
    }
    pushToast({
      type: "success",
      title: "Treino atualizado com sucesso",
      description: "Aluno já vê isso no painel dele.",
    });
    await load();
  }

  async function saveMetaKcal(alunoId: string) {
    const raw = (kcalDrafts[alunoId] ?? "").trim();
    const res = await fetch("/api/professor/student-meta-kcal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alunoId,
        metaKcalDia: raw === "" ? null : Number(raw.replace(",", ".")),
      }),
    });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      pushToast({
        type: "error",
        title: "Não salvou a meta",
        description: body.error,
      });
      return;
    }
    pushToast({
      type: "success",
      title: "Meta calórica salva",
      description: "O aluno vê isso na visão geral e na balança (kcal).",
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Professor", href: "/professor" },
          { label: "Alunos" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seus alunos</h1>
        <p className="mt-1 text-sm text-muted">
          Ajusta treinos e a meta calórica diária de cada aluno — o aluno vê a meta na conta dele.
        </p>
      </div>
      <div className="space-y-4">
        {students.map((s) => {
          const plan = plans.find((p) => p.id === s.planoId);
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">{s.nome}</p>
                  <p className="text-xs text-muted">
                    {plan?.nome ?? "Plano"} · {s.status}
                  </p>
                </div>
                <span className="text-xs text-muted">{s.email}</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-xs text-muted">
                  Meta calórica diária (kcal)
                  <input
                    type="number"
                    inputMode="numeric"
                    min={800}
                    max={6000}
                    placeholder="ex: 2200"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    value={kcalDrafts[s.id] ?? ""}
                    onChange={(e) =>
                      setKcalDrafts((d) => ({ ...d, [s.id]: e.target.value }))
                    }
                  />
                  <span className="mt-1 block text-[11px] text-neutral-500">
                    Entre 800 e 6000 kcal. Deixe vazio para remover a meta.
                  </span>
                </label>
                <div className="flex flex-col justify-end sm:items-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => void saveMetaKcal(s.id)}
                  >
                    Salvar meta kcal
                  </Button>
                </div>
              </div>
              <label className="mt-4 block text-xs text-muted">
                Treinos (um por linha)
                <textarea
                  className="mt-1 min-h-[88px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={drafts[s.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [s.id]: e.target.value }))
                  }
                />
              </label>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void saveTreinos(s.id)}
                >
                  Salvar treinos
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
