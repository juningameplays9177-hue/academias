"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlunoProfile } from "@/hooks/useAlunoProfile";
import type { StudentPanelFlags } from "@/lib/db/types";

type FeatureKey = keyof StudentPanelFlags;

const COPY: Record<
  FeatureKey,
  { title: string; crumb: string; description: string }
> = {
  treino: {
    title: "Treinos liberados",
    crumb: "Treinos",
    description: "Lista que o professor/admin montou pra você.",
  },
  agenda: {
    title: "Agenda",
    crumb: "Agenda",
    description: "Aulas avulsas e turmas fixas da unidade.",
  },
  progresso: {
    title: "Progresso",
    crumb: "Progresso",
    description: "Resumo simples — nada de gráfico 3D inútil.",
  },
  dieta: {
    title: "Nutrição",
    crumb: "Nutrição",
    description: "Orientações gerais — não substitui nutricionista presencial.",
  },
  avaliacao: {
    title: "Avaliação física",
    crumb: "Avaliação",
    description: "Resultados de testes e bioimpedância quando existirem.",
  },
};

export function AlunoFeaturePage({ feature }: { feature: FeatureKey }) {
  const { data, loading, error } = useAlunoProfile();
  const meta = COPY[feature];

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (error || !data) {
    return <p className="text-sm text-orange-600 dark:text-orange-400">{error ?? "Erro"}</p>;
  }

  const { student, classes, plan } = data;
  const inactive = student.status !== "ativo";

  if (inactive) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Aluno", href: "/aluno" },
            { label: meta.crumb },
          ]}
        />
        <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-6 text-sm text-neutral-900 dark:text-orange-50">
          Conta não está ativa — regulariza pendência pra liberar de vez.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Aluno", href: "/aluno" },
          { label: meta.crumb },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted">{meta.description}</p>
      </div>

      {feature === "treino" ? (
        <ul className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          {student.treinos.length === 0 ? (
            <li className="text-muted">Nada lançado ainda — cutuca teu professor.</li>
          ) : (
            student.treinos.map((t) => (
              <li key={t} className="rounded-lg bg-background/60 px-3 py-2">
                {t}
              </li>
            ))
          )}
        </ul>
      ) : null}

      {feature === "agenda" ? (
        <div className="space-y-3">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm"
            >
              <p className="font-semibold">{c.titulo}</p>
              <p className="text-xs capitalize text-muted">
                {c.diaSemana} · {c.horario}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {feature === "progresso" ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="text-muted">Progresso estimado</p>
          <p className="mt-2 text-4xl font-semibold">{student.progressoPct}%</p>
          <p className="mt-2 text-xs text-muted">
            Número meio genérico, mas ajuda a ver se você tá empacado há semanas.
          </p>
        </div>
      ) : null}

      {feature === "dieta" ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
          <p>
            Plano alimentar básico liberado no app físico — aqui só o resumo:{" "}
            <span className="text-foreground">
              proteína em toda refeição principal
            </span>
            , fruta não substitui legume, e água não é opcional porque você treina
            pesado.
          </p>
          <p className="mt-3 text-xs">
            Plano contratual: {plan?.nome ?? "—"} — dúvidas finas falam com a
            nutri parceira na recepção.
          </p>
        </div>
      ) : null}

      {feature === "avaliacao" ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
          <p>
            Última bioimpedância registrada em{" "}
            <span className="text-foreground">12/03</span> — percentual de gordura
            em queda leve. Próximo protocolo combinado com o professor.
          </p>
        </div>
      ) : null}
    </div>
  );
}
