"use client";

import { useCallback, useEffect, useState } from "react";
import type { DirectoryFilter, UnifiedAccount } from "@/lib/ultra/directory";
import type { RoleId } from "@/lib/rbac/roles";
import type { StudentStatus } from "@/lib/db/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/toast-context";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function roleBadgeClass(role: RoleId): string {
  switch (role) {
    case "ultra_admin":
      return "border-violet-500/50 bg-violet-500/15 text-violet-200";
    case "admin":
      return "border-orange-500/50 bg-orange-500/15 text-orange-200";
    case "professor":
      return "border-sky-500/50 bg-sky-500/15 text-sky-200";
    case "aluno":
      return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200";
    default:
      return "border-white/20 bg-white/5 text-neutral-200";
  }
}

function roleLabel(role: RoleId): string {
  switch (role) {
    case "ultra_admin":
      return "Ultra Admin";
    case "admin":
      return "Admin";
    case "professor":
      return "Professor";
    case "aluno":
      return "Aluno";
    default:
      return role;
  }
}

const FILTERS: { id: DirectoryFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "admin", label: "Staff (admin)" },
  { id: "professor", label: "Professores" },
  { id: "aluno", label: "Alunos" },
];

const STUDENT_STATUSES: StudentStatus[] = [
  "ativo",
  "pendente",
  "bloqueado",
  "inativo",
];

export function UltraDirectoryClient() {
  const { user, refresh } = useAuth();
  const { pushToast } = useToast();
  const [filter, setFilter] = useState<DirectoryFilter>("all");
  const [rows, setRows] = useState<UnifiedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<UnifiedAccount | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");

  const [resetTarget, setResetTarget] = useState<UnifiedAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [roleTarget, setRoleTarget] = useState<UnifiedAccount | null>(null);
  const [nextRole, setNextRole] = useState<RoleId>("admin");

  const [createOpen, setCreateOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState<"admin" | "ultra_admin">("admin");
  const [cAcademiaId, setCAcademiaId] = useState("");
  const [academyOptions, setAcademyOptions] = useState<{ id: string; nome: string }[]>(
    [],
  );
  const [creating, setCreating] = useState(false);

  const [studentDraft, setStudentDraft] = useState<Record<string, StudentStatus>>(
    {},
  );
  const [moveTarget, setMoveTarget] = useState<UnifiedAccount | null>(null);
  const [moveAcademiaId, setMoveAcademiaId] = useState("");
  const [movingAcademia, setMovingAcademia] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/academias", { cache: "no-store" });
      const j = (await res.json()) as {
        academias?: { id: string; nome: string; status?: string }[];
      };
      if (cancelled) return;
      const opts = (j.academias ?? []).filter((a) => (a.status ?? "ativo") === "ativo");
      setAcademyOptions(opts.map((a) => ({ id: a.id, nome: a.nome })));
      if (opts.length) {
        setCAcademiaId((prev) => prev || opts[0].id);
        setMoveAcademiaId((prev) => prev || opts[0].id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ultra-admin/directory?tipo=${encodeURIComponent(filter)}`,
        { cache: "no-store" },
      );
      const body = (await res.json()) as {
        accounts?: UnifiedAccount[];
        error?: string;
      };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Erro ao carregar",
          description: body.error ?? "Tente novamente.",
        });
        return;
      }
      setRows(body.accounts ?? []);
      setStudentDraft({});
    } catch {
      pushToast({
        type: "error",
        title: "Rede",
        description: "Não foi possível carregar o diretório.",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, pushToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchStaff(
    id: string,
    patch: Record<string, unknown>,
  ): Promise<boolean> {
    const res = await fetch(`/api/ultra-admin/staff/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast({
        type: "error",
        title: "Não foi possível salvar",
        description: body.error,
      });
      return false;
    }
    return true;
  }

  async function toggleStaffBlock(row: UnifiedAccount) {
    if (row.kind !== "staff") return;
    if (row.id === user?.id) {
      pushToast({
        type: "error",
        title: "Indisponível",
        description: "Use outro Ultra Admin para bloquear a própria conta staff.",
      });
      return;
    }
    const next = row.loginBloqueado ? "ativo" : "bloqueado";
    const ok = await patchStaff(row.id, { status: next });
    if (ok) {
      pushToast({
        type: "success",
        title: next === "bloqueado" ? "Conta bloqueada" : "Conta ativada",
      });
      void load();
      void refresh();
    }
  }

  async function applyStudentStatus(row: UnifiedAccount) {
    if (row.kind !== "student") return;
    const next = studentDraft[row.id] ?? (row.statusLabel as StudentStatus);
    const res = await fetch(`/api/ultra-admin/student/${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast({
        type: "error",
        title: "Aluno",
        description: body.error,
      });
      return;
    }
    pushToast({ type: "success", title: "Status do aluno atualizado" });
    void load();
  }

  async function toggleProfessorBlock(row: UnifiedAccount) {
    if (row.kind !== "professor") return;
    const res = await fetch(`/api/ultra-admin/professor/${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contaBloqueada: !row.loginBloqueado }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast({
        type: "error",
        title: "Professor",
        description: body.error,
      });
      return;
    }
    pushToast({
      type: "success",
      title: row.loginBloqueado ? "Professor desbloqueado" : "Professor bloqueado",
    });
    void load();
  }

  async function submitReset() {
    if (!resetTarget || newPassword.length < 6) {
      pushToast({
        type: "error",
        title: "Senha",
        description: "Informe uma nova senha com pelo menos 6 caracteres.",
      });
      return;
    }
    if (resetTarget.kind === "staff") {
      const ok = await patchStaff(resetTarget.id, { newPassword });
      if (ok) {
        pushToast({ type: "success", title: "Senha do staff redefinida" });
        setResetTarget(null);
        setNewPassword("");
        void load();
      }
      return;
    }
    if (resetTarget.kind === "professor") {
      const res = await fetch(
        `/api/ultra-admin/professor/${encodeURIComponent(resetTarget.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        },
      );
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Professor",
          description: body.error,
        });
        return;
      }
      pushToast({ type: "success", title: "Senha do professor redefinida" });
      setResetTarget(null);
      setNewPassword("");
      void load();
    }
  }

  async function submitRole() {
    if (!roleTarget || roleTarget.kind !== "staff") return;
    const ok = await patchStaff(roleTarget.id, { role: nextRole });
    if (ok) {
      pushToast({ type: "success", title: "Papel atualizado" });
      setRoleTarget(null);
      void load();
      void refresh();
    }
  }

  async function submitDelete() {
    if (!deleteTarget || deleteTarget.kind !== "staff") return;
    if (deletePhrase !== "DELETAR") {
      pushToast({
        type: "error",
        title: "Confirmação",
        description: 'Digite exatamente DELETAR para confirmar.',
      });
      return;
    }
    const res = await fetch(`/api/ultra-admin/staff/${encodeURIComponent(deleteTarget.id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmPhrase: "DELETAR" }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast({
        type: "error",
        title: "Exclusão",
        description: body.error,
      });
      return;
    }
    pushToast({ type: "success", title: "Usuário removido" });
    setDeleteTarget(null);
    setDeletePhrase("");
    void load();
  }

  async function submitCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/ultra-admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cName,
          email: cEmail,
          password: cPassword,
          role: cRole,
          academiaId: cRole === "admin" ? cAcademiaId : undefined,
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Cadastro staff",
          description: body.error,
        });
        return;
      }
      pushToast({ type: "success", title: "Conta staff criada" });
      setCreateOpen(false);
      setCName("");
      setCEmail("");
      setCPassword("");
      setCRole("admin");
      setCAcademiaId(academyOptions[0]?.id ?? "");
      void load();
    } finally {
      setCreating(false);
    }
  }

  async function submitMoveAcademia() {
    if (!moveTarget) return;
    if (!moveAcademiaId) {
      pushToast({
        type: "error",
        title: "Academia",
        description: "Selecione a academia destino.",
      });
      return;
    }
    setMovingAcademia(true);
    try {
      if (moveTarget.kind === "staff") {
        const ok = await patchStaff(moveTarget.id, { academiaId: moveAcademiaId });
        if (!ok) return;
      } else if (moveTarget.kind === "professor") {
        const res = await fetch(
          `/api/ultra-admin/professor/${encodeURIComponent(moveTarget.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ academiaId: moveAcademiaId }),
          },
        );
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          pushToast({
            type: "error",
            title: "Professor",
            description: body.error,
          });
          return;
        }
      } else if (moveTarget.kind === "student") {
        const res = await fetch(
          `/api/ultra-admin/student/${encodeURIComponent(moveTarget.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ academiaId: moveAcademiaId }),
          },
        );
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          pushToast({
            type: "error",
            title: "Aluno",
            description: body.error,
          });
          return;
        }
      }
      pushToast({ type: "success", title: "Academia atualizada" });
      setMoveTarget(null);
      void load();
      void refresh();
    } finally {
      setMovingAcademia(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                filter === f.id
                  ? "border-orange-500 bg-orange-500/20 text-orange-100"
                  : "border-white/15 text-neutral-300 hover:border-white/30 hover:text-white",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Novo staff
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Academia</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Carregando diretório…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Nenhuma conta neste filtro.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="text-neutral-200">
                  <td className="px-4 py-3 font-medium text-white">{row.nome}</td>
                  <td className="px-4 py-3 text-neutral-400">{row.email}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {row.academiaNome}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        roleBadgeClass(row.role),
                      )}
                    >
                      {roleLabel(row.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs",
                        row.loginBloqueado ? "text-red-300" : "text-emerald-300/90",
                      )}
                    >
                      {row.statusLabel}
                      {row.loginBloqueado ? " · login bloqueado" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.kind === "staff" ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            onClick={() => {
                              setRoleTarget(row);
                              setNextRole(row.role);
                            }}
                          >
                            Papel
                          </Button>
                          {row.role === "admin" ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="border-white/20 text-xs text-white"
                              onClick={() => {
                                setMoveTarget(row);
                                setMoveAcademiaId(row.academiaId ?? academyOptions[0]?.id ?? "");
                              }}
                            >
                              Academia
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            disabled={row.id === user?.id}
                            onClick={() => void toggleStaffBlock(row)}
                          >
                            {row.loginBloqueado ? "Desbloquear" : "Bloquear"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            onClick={() => {
                              setResetTarget(row);
                              setNewPassword("");
                            }}
                          >
                            Senha
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-500/40 text-xs text-red-200 hover:bg-red-500/10"
                            disabled={row.id === user?.id}
                            onClick={() => {
                              setDeleteTarget(row);
                              setDeletePhrase("");
                            }}
                          >
                            Excluir
                          </Button>
                        </>
                      ) : null}
                      {row.kind === "professor" ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            onClick={() => {
                              setMoveTarget(row);
                              setMoveAcademiaId(row.academiaId ?? academyOptions[0]?.id ?? "");
                            }}
                          >
                            Academia
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            onClick={() => void toggleProfessorBlock(row)}
                          >
                            {row.loginBloqueado ? "Desbloquear" : "Bloquear"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            onClick={() => {
                              setResetTarget(row);
                              setNewPassword("");
                            }}
                          >
                            Senha
                          </Button>
                        </>
                      ) : null}
                      {row.kind === "student" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            onClick={() => {
                              setMoveTarget(row);
                              setMoveAcademiaId(row.academiaId ?? academyOptions[0]?.id ?? "");
                            }}
                          >
                            Academia
                          </Button>
                          <select
                            className="rounded-lg border border-white/15 bg-black px-2 py-1.5 text-xs text-white"
                            value={
                              studentDraft[row.id] ??
                              (STUDENT_STATUSES.includes(row.statusLabel as StudentStatus)
                                ? (row.statusLabel as StudentStatus)
                                : "ativo")
                            }
                            onChange={(e) =>
                              setStudentDraft((d) => ({
                                ...d,
                                [row.id]: e.target.value as StudentStatus,
                              }))
                            }
                          >
                            {STUDENT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 text-xs text-white"
                            onClick={() => void applyStudentStatus(row)}
                          >
                            Aplicar
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={createOpen}
        title="Novo usuário staff"
        description="Admin ou Ultra Admin. E-mail único em todo o sistema."
        onClose={() => setCreateOpen(false)}
        size="lg"
      >
        <div className="space-y-3 text-sm">
          <label className="block text-neutral-300">
            Nome
            <input
              className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
            />
          </label>
          <label className="block text-neutral-300">
            E-mail
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
            />
          </label>
          <label className="block text-neutral-300">
            Senha inicial
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
            />
          </label>
          <label className="block text-neutral-300">
            Papel
            <select
              className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
              value={cRole}
              onChange={(e) =>
                setCRole(e.target.value as "admin" | "ultra_admin")
              }
            >
              <option value="admin">Admin</option>
              <option value="ultra_admin">Ultra Admin</option>
            </select>
          </label>
          {cRole === "admin" ? (
            <label className="block text-neutral-300">
              Academia
              <select
                className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
                value={cAcademiaId}
                onChange={(e) => setCAcademiaId(e.target.value)}
              >
                {academyOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={creating} onClick={() => void submitCreate()}>
              {creating ? "Salvando…" : "Criar"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(roleTarget)}
        title="Alterar papel (staff)"
        description="Rebaixar o último Ultra Admin é bloqueado pelo servidor."
        onClose={() => setRoleTarget(null)}
      >
        {roleTarget ? (
          <div className="space-y-3 text-sm text-neutral-200">
            <p>
              <span className="text-neutral-400">Conta:</span> {roleTarget.nome} (
              {roleTarget.email})
            </p>
            <select
              className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
              value={nextRole}
              onChange={(e) => setNextRole(e.target.value as RoleId)}
            >
              <option value="admin">Admin</option>
              <option value="ultra_admin">Ultra Admin</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRoleTarget(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void submitRole()}>
                Salvar
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(moveTarget)}
        title="Alterar academia do usuário"
        description="Move o vínculo principal da conta para outra unidade ativa."
        onClose={() => setMoveTarget(null)}
      >
        {moveTarget ? (
          <div className="space-y-3 text-sm text-neutral-200">
            <p>
              <span className="text-neutral-400">Conta:</span> {moveTarget.nome} (
              {moveTarget.email})
            </p>
            <select
              className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
              value={moveAcademiaId}
              onChange={(e) => setMoveAcademiaId(e.target.value)}
            >
              {academyOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setMoveTarget(null)}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={movingAcademia}
                onClick={() => void submitMoveAcademia()}
              >
                {movingAcademia ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(resetTarget)}
        title="Redefinir senha"
        description={
          resetTarget?.kind === "staff"
            ? "Nova senha da conta staff (admin / ultra)."
            : "Define senha de plataforma do professor (substitui demo)."
        }
        onClose={() => {
          setResetTarget(null);
          setNewPassword("");
        }}
      >
        <div className="space-y-3 text-sm">
          <input
            type="password"
            placeholder="Nova senha (mín. 6)"
            className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResetTarget(null);
                setNewPassword("");
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={() => void submitReset()}>
              Redefinir
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Excluir conta staff"
        description={
          deleteTarget?.role === "ultra_admin"
            ? "Esta é uma conta Ultra Admin. Só prossiga se outro Ultra existir. Digite DELETAR."
            : deleteTarget?.role === "admin"
              ? "Exclusão de administrador — irreversível. Digite DELETAR para confirmar."
              : "Remoção permanente. Digite DELETAR para confirmar."
        }
        onClose={() => {
          setDeleteTarget(null);
          setDeletePhrase("");
        }}
        size="lg"
      >
        <div className="space-y-3 text-sm text-neutral-200">
          <input
            type="text"
            autoComplete="off"
            placeholder="DELETAR"
            className="w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-white"
            value={deletePhrase}
            onChange={(e) => setDeletePhrase(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeletePhrase("");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-500"
              onClick={() => void submitDelete()}
            >
              Excluir definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
