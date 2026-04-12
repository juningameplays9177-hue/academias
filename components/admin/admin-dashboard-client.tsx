"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faWallet, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardData = {
  alunosTotal: number;
  alunosAtivos: number;
  professores: number;
  faturamentoMensalEstimado: number;
  planosPorNome: { nome: string; quantidade: number }[];
};

export function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.ok) {
        setData((await res.json()) as DashboardData);
      }
    })();
  }, []);

  const maxQ =
    data?.planosPorNome.reduce(
      (m, p) => Math.max(m, p.quantidade),
      1,
    ) ?? 1;

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Dashboard" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-muted">
          Números estimados a partir dos planos ativos — não substitui ERP.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Alunos ativos"
          value={data?.alunosAtivos}
          hint={`${data?.alunosTotal ?? "—"} cadastrados no arquivo`}
          icon={faUsers}
        />
        <MetricCard
          title="Faturamento mensal (estimado)"
          value={
            data
              ? `R$ ${data.faturamentoMensalEstimado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`
              : undefined
          }
          hint="Soma simples dos planos atuais"
          icon={faWallet}
        />
        <MetricCard
          title="Professores"
          value={data?.professores}
          hint="Equipe técnica cadastrada"
          icon={faIdCard}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Alunos por plano</h2>
          <p className="mt-1 text-xs text-muted">
            Gráfico simples — só pra bater o olho em reunião.
          </p>
          <div className="mt-6 space-y-4">
            {!data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              data.planosPorNome.map((p) => (
                <div key={p.nome}>
                  <div className="flex justify-between text-xs text-muted">
                    <span>{p.nome}</span>
                    <span>{p.quantidade}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{
                        width: `${Math.max(8, (p.quantidade / maxQ) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Lembretes</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>• Conferir cancelamentos antes do fechamento.</li>
            <li>• Turma 19h quase lotada — avisa marketing.</li>
            <li>• Backup do arquivo local ainda é manual (demo).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value?: string | number;
  hint: string;
  icon: typeof faUsers;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {title}
        </p>
        <FontAwesomeIcon icon={icon} className="text-accent" />
      </div>
      <p className="mt-3 text-2xl font-semibold">
        {value === undefined ? "—" : value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
