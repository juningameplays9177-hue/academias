"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlunoProfile } from "@/hooks/useAlunoProfile";
import { brDateKey, formatDateKeyPt } from "@/lib/date/br-date-key";

export function AlunoHomeClient() {
  const { data, loading, error, refresh } = useAlunoProfile();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-orange-500 dark:text-orange-400">
        {error ?? "Não foi possível carregar seu perfil."}
      </p>
    );
  }

  const { student, plan, professor, notices } = data;
  const blocked = student.status !== "ativo";
  const hojeKcal = student.consumoKcalPorDia?.[brDateKey()] ?? 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Aluno", href: "/aluno" },
          { label: "Visão geral" },
        ]}
      />
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Oi, {student.nome.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Plano atual:{" "}
            <span className="text-foreground">{plan?.nome ?? "—"}</span> ·
            status{" "}
            <span className="capitalize text-foreground">{student.status}</span>
          </p>
          {professor ? (
            <p className="mt-2 text-xs text-muted">
              Professor(a) de referência:{" "}
              <span className="text-foreground">{professor.nome}</span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="self-start rounded-full border border-border px-3 py-1 text-xs text-muted hover:border-accent/50 hover:text-foreground"
        >
          Atualizar dados
        </button>
      </div>

      {blocked ? (
        <div
          className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-neutral-900 dark:text-orange-50"
          role="alert"
        >
          <p className="font-semibold text-neutral-950 dark:text-white">Acesso limitado</p>
          <p className="mt-1 text-xs text-neutral-800 dark:text-orange-100/90">
            Seu cadastro não está como &quot;ativo&quot; — algumas abas vão
            aparecer bloqueadas até regularizar na recepção.
          </p>
        </div>
      ) : null}

      {student.avisoPainel ? (
        <div
          className="rounded-2xl border border-orange-600/50 bg-orange-500/15 p-4 text-sm text-neutral-900 dark:text-orange-50"
          role="status"
        >
          <p className="font-semibold text-neutral-950 dark:text-white">Recado da operação</p>
          <p className="mt-1 text-xs text-neutral-800 dark:text-orange-100/90">{student.avisoPainel}</p>
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4">
        <h2 className="text-sm font-semibold text-white">Meta calórica diária</h2>
        {student.metaKcalDia != null ? (
          <>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-orange-300">
              {student.metaKcalDia.toLocaleString("pt-BR")}{" "}
              <span className="text-base font-normal text-neutral-400">kcal/dia</span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Definida pelo seu professor
              {professor ? ` (${professor.nome})` : ""}. A estimativa na balança digital ajuda a comparar com essa
              meta — não substitui orientação nutricional.
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              Registrado hoje ({formatDateKeyPt(brDateKey())}):{" "}
              <span className="font-semibold text-neutral-200">
                {hojeKcal.toLocaleString("pt-BR")} kcal
              </span>{" "}
              — some refeições na balança para atualizar.
            </p>
            <Link
              href="/aluno/balanca"
              className="mt-3 inline-block text-sm font-medium text-orange-400 hover:text-orange-300"
            >
              Abrir balança (kcal) →
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-neutral-500">
              Seu professor ainda não cadastrou uma meta diária de calorias. Quando estiver disponível, ela aparece aqui
              e na página <span className="text-neutral-300">Balança (kcal)</span>.
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              Registrado hoje:{" "}
              <span className="font-semibold text-neutral-200">
                {hojeKcal.toLocaleString("pt-BR")} kcal
              </span>
            </p>
            <Link
              href="/aluno/balanca"
              className="mt-3 inline-block text-sm font-medium text-orange-400 hover:text-orange-300"
            >
              Abrir balança (kcal) →
            </Link>
          </>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Avisos</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted">
            {notices.slice(0, 4).map((n) => (
              <li key={n.id}>
                <p className="font-medium text-foreground">{n.titulo}</p>
                <p className="text-xs">{n.corpo}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Permissões ativas</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
            {Object.entries(student.permissoes).map(([k, v]) => (
              <li
                key={k}
                className={`rounded-lg border px-2 py-2 capitalize ${
                  v
                    ? "border-orange-500/40 text-orange-700 dark:text-orange-200"
                    : "border-border text-neutral-500 line-through"
                }`}
              >
                {k}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
