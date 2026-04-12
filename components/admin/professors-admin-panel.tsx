"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { ProfessorRecord } from "@/lib/db/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";

export function ProfessorsAdminPanel() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState<ProfessorRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProfessorRecord | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/professors", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { professors: ProfessorRecord[] };
      setRows(data.professors);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setNome("");
    setEmail("");
    setTelefone("");
    setEspecialidade("");
    setOpen(true);
  }

  function openEdit(p: ProfessorRecord) {
    setEditing(p);
    setNome(p.nome);
    setEmail(p.email);
    setTelefone(p.telefone);
    setEspecialidade(p.especialidade);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/professors/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, telefone, especialidade }),
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          pushToast({
            type: "error",
            title: "Erro",
            description: body.error,
          });
          return;
        }
        pushToast({ type: "success", title: "Professor atualizado" });
      } else {
        const res = await fetch("/api/admin/professors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, telefone, especialidade }),
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          pushToast({
            type: "error",
            title: "Erro",
            description: body.error,
          });
          return;
        }
        pushToast({ type: "success", title: "Professor criado" });
      }
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remover professor?")) return;
    const res = await fetch(`/api/admin/professors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      pushToast({
        type: "error",
        title: "Não removeu",
        description: body.error,
      });
      return;
    }
    pushToast({ type: "success", title: "Removido" });
    await load();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Professores" },
        ]}
      />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Professores</h1>
          <p className="mt-1 text-sm text-muted">
            E-mail duplicado com aluno não passa — evita login confuso.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <FontAwesomeIcon icon={faPlus} />
          Novo professor
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-muted dark:bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Especialidade</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-t border-border hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3 font-medium">{p.nome}</td>
                <td className="px-4 py-3 text-xs text-muted">{p.email}</td>
                <td className="px-4 py-3 text-xs">{p.especialidade}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(p)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => void remove(p.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar professor" : "Novo professor"}
      >
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <div className="mt-3">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={Boolean(editing)}
          />
        </div>
        <div className="mt-3">
          <Input
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <Input
            label="Especialidade"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
