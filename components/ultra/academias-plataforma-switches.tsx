"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";

type AcademiaRow = {
  id: string;
  nome: string;
  slug: string;
  status: string;
  plataformaDesligada: boolean;
};

export function AcademiasPlataformaSwitches() {
  const { pushToast } = useToast();
  const [list, setList] = useState<AcademiaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/academias", { cache: "no-store" });
      const j = (await res.json()) as { academias?: AcademiaRow[] };
      if (res.ok) setList(j.academias ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(row: AcademiaRow, next: boolean) {
    setBusyId(row.id);
    try {
      const res = await fetch(
        `/api/academias/${encodeURIComponent(row.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plataformaDesligada: next }),
        },
      );
      const j = (await res.json()) as { error?: string; academia?: AcademiaRow };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Não foi possível atualizar",
          description: j.error,
        });
        return;
      }
      if (j.academia) {
        setList((prev) =>
          prev.map((a) => (a.id === j.academia!.id ? { ...a, ...j.academia! } : a)),
        );
      }
      pushToast({
        type: "success",
        title: next ? "Unidade suspensa" : "Unidade reativada",
        description: next
          ? `${row.nome}: painéis e APIs desta academia ficam bloqueados para admin, professor e aluno.`
          : `${row.nome}: acesso normal restaurado.`,
      });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-neutral-500">
        Carregando academias…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">
            Suspender plataforma por academia
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            Escolha <strong className="text-violet-200">qual unidade</strong> fica sem acesso ao
            painel (admin, professor e aluno). O Ultra Admin continua podendo entrar nessa unidade
            para administrar ou religar. O interruptor <em>Site público</em> abaixo continua valendo
            para <strong>toda</strong> a rede.
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {list.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-200">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white">{a.nome}</p>
                <p className="text-xs text-neutral-500">@{a.slug}</p>
                {a.status !== "ativo" ? (
                  <p className="mt-1 text-xs text-amber-400">Academia inativa no cadastro.</p>
                ) : null}
                {a.plataformaDesligada ? (
                  <p className="mt-1 text-xs font-medium text-orange-300">
                    Plataforma desta unidade suspensa
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-neutral-500">Plataforma ativa para esta unidade</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {a.plataformaDesligada ? (
                <Button
                  type="button"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-500"
                  disabled={busyId === a.id || a.status !== "ativo"}
                  onClick={() => void toggle(a, false)}
                >
                  Reativar unidade
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  className="gap-2"
                  disabled={busyId === a.id || a.status !== "ativo"}
                  onClick={() => void toggle(a, true)}
                >
                  <FontAwesomeIcon icon={faPowerOff} className="text-xs" />
                  Suspender unidade
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
