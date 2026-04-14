"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faMapLocationDot,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { CreateAcademyModal } from "@/components/ultra/create-academy-modal";
import { Button } from "@/components/ui/button";
import { useAcademies, type AcademiaDTO } from "@/hooks/useAcademies";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/utils/cn";

export function AcademiasUltraAdminDashboard() {
  const { pushToast } = useToast();
  const { refresh: refreshAuth } = useAuth();
  const {
    academias,
    loading,
    error,
    getAcademies,
    createAcademy,
    updateAcademy,
    deleteAcademy,
  } = useAcademies();

  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "ativo" | "inativa">("todas");
  const [filtroUf, setFiltroUf] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AcademiaDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademiaDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void getAcademies();
  }, [getAcademies]);

  const filtradas = useMemo(() => {
    const uq = q.trim().toLowerCase();
    const uf = filtroUf.trim().toUpperCase();
    return academias.filter((a) => {
      if (filtroStatus !== "todas" && a.status !== filtroStatus) return false;
      if (uf && (a.estado ?? "").toUpperCase() !== uf) return false;
      if (!uq) return true;
      const blob = `${a.nome} ${a.slug} ${a.email ?? ""} ${a.cidade ?? ""} ${a.googleMapsUrl ?? ""}`.toLowerCase();
      return blob.includes(uq);
    });
  }, [academias, q, filtroStatus, filtroUf]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAcademy(deleteTarget.id);
      pushToast({
        type: "success",
        title: "Academia removida",
        description: `${deleteTarget.nome} foi excluída do cadastro.`,
      });
      setDeleteTarget(null);
    } catch (e) {
      pushToast({
        type: "error",
        title: "Não foi possível excluir",
        description: e instanceof Error ? e.message : "Erro",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-white">Academias da rede</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">
            Cada nova unidade ganha página pública própria (<span className="font-mono text-neutral-300">/a/slug</span>),
            pasta só dela em{" "}
            <span className="font-mono text-neutral-300">
              {"data/tenants/{idDaUnidade}/tenant.json"}
            </span>{" "}
            (isolada das
            outras) e cores/contatos independentes. Em status <span className="text-neutral-200">ativo</span>, já nascem
            os três planos padrão (Básico, Full time, Performance) nesse arquivo.
          </p>
        </div>
        <Button
          type="button"
          className="gap-2 self-start sm:self-auto"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          Adicionar academia
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative min-w-0 flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, slug, e-mail ou cidade…"
            className="w-full rounded-lg border border-white/15 bg-black/40 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500/50"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 lg:w-44"
        >
          <option value="todas">Todas (status)</option>
          <option value="ativo">Somente ativas</option>
          <option value="inativa">Somente inativas</option>
        </select>
        <input
          value={filtroUf}
          onChange={(e) => setFiltroUf(e.target.value.toUpperCase().slice(0, 2))}
          placeholder="UF"
          maxLength={2}
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 lg:w-20"
        />
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Carregando…</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((a) => (
            <li
              key={a.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-black/40 p-5 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/50">
                  {a.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL dinâmica (upload / data URL)
                    <img src={a.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-orange-400/80">
                      {a.nome.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{a.nome}</p>
                  <p className="font-mono text-xs text-neutral-500">@{a.slug}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        a.status === "ativo"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-neutral-600/40 text-neutral-300",
                      )}
                    >
                      {a.status}
                    </span>
                    {a.plataformaDesligada ? (
                      <span className="rounded-full bg-orange-500/25 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-200">
                        Plataforma off
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                {(a.cidade ?? "—") + (a.estado ? ` · ${a.estado}` : "")}
              </p>
              <p className="truncate text-xs text-neutral-400">{a.email ?? "—"}</p>
              {a.googleMapsUrl ? (
                <a
                  href={a.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-orange-300/90 underline-offset-2 hover:text-orange-200 hover:underline"
                >
                  <FontAwesomeIcon icon={faMapLocationDot} className="text-[11px]" />
                  Abrir no Google Maps
                </a>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-neutral-200 hover:bg-white/10"
                  onClick={() => {
                    setEditing(a);
                    setModalOpen(true);
                  }}
                >
                  <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(a)}
                >
                  <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && filtradas.length === 0 ? (
        <p className="text-center text-sm text-neutral-500">
          Nenhuma academia encontrada com esses filtros.
        </p>
      ) : null}

      <CreateAcademyModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        editing={editing}
        onAfterSave={() => {
          void getAcademies();
          void refreshAuth();
        }}
        onCreate={createAcademy}
        onUpdate={updateAcademy}
      />

      {deleteTarget ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Excluir academia?</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Confirma a exclusão permanente de{" "}
              <span className="font-medium text-white">{deleteTarget.nome}</span>? Só é permitido
              se não houver alunos, professores, staff ou outros dados vinculados.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button type="button" variant="danger" disabled={deleting} onClick={() => void confirmDelete()}>
                {deleting ? "Excluindo…" : "Excluir definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
