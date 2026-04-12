"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faPlus,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import type {
  PlanRecord,
  ProfessorRecord,
  StudentPanelFlags,
  StudentRecord,
  StudentStatus,
} from "@/lib/db/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Toggle } from "@/components/ui/toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/contexts/toast-context";

type ListResponse = {
  students: StudentRecord[];
  plans: PlanRecord[];
  professors: ProfessorRecord[];
};

const STATUS_OPTIONS: { value: StudentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "pendente", label: "Pendente" },
  { value: "bloqueado", label: "Bloqueado" },
  { value: "inativo", label: "Inativo" },
];

const DEFAULT_PERMS: StudentPanelFlags = {
  treino: false,
  dieta: false,
  agenda: false,
  progresso: false,
  avaliacao: false,
};

function mergeStudentPermissions(
  draft: Partial<StudentRecord>,
  key: keyof StudentPanelFlags,
  value: boolean,
): StudentPanelFlags {
  return { ...DEFAULT_PERMS, ...draft.permissoes, [key]: value };
}

const emptyStudent = (): Partial<StudentRecord> => ({
  nome: "",
  email: "",
  telefone: "",
  planoId: "plan-basico",
  status: "pendente",
  professorId: null,
  permissoes: {
    treino: true,
    dieta: false,
    agenda: true,
    progresso: true,
    avaliacao: false,
  },
  treinos: [],
  avisoPainel: "",
  progressoPct: 0,
});

export function StudentsAdminPanel() {
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<StudentRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [professors, setProfessors] = useState<ProfessorRecord[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StudentStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRecord | null>(null);
  const [draft, setDraft] = useState<Partial<StudentRecord>>(emptyStudent());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/students?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      pushToast({ type: "error", title: "Erro ao listar alunos" });
      setLoading(false);
      return;
    }
    const data = (await res.json()) as ListResponse;
    setList(data.students);
    setPlans(data.plans);
    setProfessors(data.professors);
    setLoading(false);
  }, [pushToast, q, status]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setDraft(emptyStudent());
    setModalOpen(true);
  }

  function openEdit(s: StudentRecord) {
    setEditing(s);
    setDraft({ ...s, treinos: [...s.treinos] });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/students/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          pushToast({
            type: "error",
            title: "Não salvou",
            description: body.error,
          });
          return;
        }
        pushToast({
          type: "success",
          title: "Aluno atualizado",
          description: "Painel do aluno já puxa essas configs na próxima carga.",
        });
      } else {
        const res = await fetch("/api/admin/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          pushToast({
            type: "error",
            title: "Cadastro travou",
            description: body.error,
          });
          return;
        }
        pushToast({
          type: "success",
          title: "Aluno criado",
          description: "Combina com e-mail certinho pra login funcionar.",
        });
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, nome: string) {
    const ok = window.confirm(
      `Apagar ${nome}? Isso some do arquivo local — sem drama de nuvem.`,
    );
    if (!ok) return;
    const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast({ type: "error", title: "Não apagou" });
      return;
    }
    pushToast({ type: "success", title: "Removido" });
    await load();
  }

  const treinosText = useMemo(() => (draft.treinos ?? []).join("\n"), [draft.treinos]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Alunos" },
        ]}
      />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alunos</h1>
          <p className="mt-1 text-sm text-muted">
            Tudo que você mexer aqui reflete no painel do aluno na hora do
            refresh — igual produto real, só que sem banco caro.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <FontAwesomeIcon icon={faPlus} />
          Novo aluno
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca por nome ou e-mail"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none ring-accent/20 focus:ring-2"
            aria-label="Buscar alunos"
          />
        </div>
        <label className="text-sm text-muted">
          Status
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as StudentStatus | "all")
            }
            className="ml-2 rounded-lg border border-border bg-card px-2 py-2 text-sm text-foreground"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-muted dark:bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6">
                  <Skeleton className="h-10 w-full" />
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Nada encontrado com esse filtro.
                </td>
              </tr>
            ) : (
              list.map((s) => {
                const plan = plans.find((p) => p.id === s.planoId);
                return (
                  <tr
                    key={s.id}
                    className="border-t border-border hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.nome}</p>
                      <p className="text-xs text-muted">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{plan?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-xs capitalize">{s.status}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(s)}
                        aria-label={`Editar ${s.nome}`}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => void handleDelete(s.id, s.nome)}
                        aria-label={`Excluir ${s.nome}`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar aluno" : "Novo aluno"}
        description="Permissões abaixo controlam o que aparece no painel do aluno."
        size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nome"
            value={draft.nome ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, nome: e.target.value }))}
          />
          <Input
            label="E-mail (login)"
            type="email"
            value={draft.email ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, email: e.target.value }))
            }
            disabled={Boolean(editing)}
          />
          <Input
            label="Telefone"
            value={draft.telefone ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, telefone: e.target.value }))
            }
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Plano</span>
            <select
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={draft.planoId ?? "plan-basico"}
              onChange={(e) =>
                setDraft((d) => ({ ...d, planoId: e.target.value }))
              }
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Status</span>
            <select
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm capitalize"
              value={draft.status ?? "pendente"}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  status: e.target.value as StudentStatus,
                }))
              }
            >
              {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Professor</span>
            <select
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={draft.professorId ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  professorId: e.target.value || null,
                }))
              }
            >
              <option value="">—</option>
              {professors.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Progresso (%)"
            type="number"
            min={0}
            max={100}
            value={draft.progressoPct ?? 0}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                progressoPct: Number(e.target.value),
              }))
            }
          />
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Painel do aluno — chaves granulares
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <Toggle
              label="Treinos"
              description="Fichas e lista do que foi liberado"
              checked={Boolean(draft.permissoes?.treino)}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  permissoes: mergeStudentPermissions(d, "treino", v),
                }))
              }
            />
            <Toggle
              label="Nutrição"
              description="Plano alimentar / dicas"
              checked={Boolean(draft.permissoes?.dieta)}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  permissoes: mergeStudentPermissions(d, "dieta", v),
                }))
              }
            />
            <Toggle
              label="Agenda"
              description="Aulas e horários combinados"
              checked={Boolean(draft.permissoes?.agenda)}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  permissoes: mergeStudentPermissions(d, "agenda", v),
                }))
              }
            />
            <Toggle
              label="Progresso"
              description="Cargas, medidas, fotos de evolução"
              checked={Boolean(draft.permissoes?.progresso)}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  permissoes: mergeStudentPermissions(d, "progresso", v),
                }))
              }
            />
            <Toggle
              label="Avaliação física"
              description="Bioimpedância e protocolos"
              checked={Boolean(draft.permissoes?.avaliacao)}
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  permissoes: mergeStudentPermissions(d, "avaliacao", v),
                }))
              }
            />
          </div>
        </div>

        <label className="mt-4 block text-sm">
          <span className="text-muted">Treinos (um por linha)</span>
          <textarea
            className="mt-1 min-h-[96px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={treinosText}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                treinos: e.target.value
                  .split("\n")
                  .map((t) => t.trim())
                  .filter(Boolean),
              }))
            }
          />
        </label>

        <Input
          label="Aviso no painel do aluno"
          value={draft.avisoPainel ?? ""}
          onChange={(e) =>
            setDraft((d) => ({ ...d, avisoPainel: e.target.value }))
          }
          placeholder="Ex.: mensalidade em atraso"
        />

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
