"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { PlanRecord } from "@/lib/db/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";

export function PlansAdminPanel() {
  const { pushToast } = useToast();
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlanRecord | null>(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState(0);
  const [beneficios, setBeneficios] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/plans", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { plans: PlanRecord[] };
      setPlans(data.plans);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setNome("");
    setPreco(99);
    setBeneficios("");
    setOpen(true);
  }

  function openEdit(p: PlanRecord) {
    setEditing(p);
    setNome(p.nome);
    setPreco(p.precoMensal);
    setBeneficios(p.beneficios.join("\n"));
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const beneficiosList = beneficios
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean);
      if (editing) {
        const res = await fetch(`/api/admin/plans/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            precoMensal: preco,
            beneficios: beneficiosList,
          }),
        });
        if (!res.ok) {
          pushToast({ type: "error", title: "Erro ao salvar plano" });
          return;
        }
        pushToast({ type: "success", title: "Plano atualizado" });
      } else {
        const res = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            precoMensal: preco,
            beneficios: beneficiosList,
          }),
        });
        if (!res.ok) {
          pushToast({ type: "error", title: "Erro ao criar plano" });
          return;
        }
        pushToast({ type: "success", title: "Plano criado" });
      }
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Apagar plano?")) return;
    const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      pushToast({
        type: "error",
        title: "Não apagou",
        description: body.error,
      });
      return;
    }
    pushToast({ type: "success", title: "Plano removido" });
    await load();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Planos" },
        ]}
      />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planos</h1>
          <p className="mt-1 text-sm text-muted">
            Preço e benefícios — alunos já matriculados continuam no arquivo com o
            id do plano.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <FontAwesomeIcon icon={faPlus} />
          Novo plano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-4"
          >
            <h2 className="text-lg font-semibold">{p.nome}</h2>
            <p className="mt-2 text-2xl font-semibold">
              R${" "}
              {p.precoMensal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <ul className="mt-3 flex-1 space-y-1 text-xs text-muted">
              {p.beneficios.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => openEdit(p)}
              >
                <FontAwesomeIcon icon={faPen} />
                Editar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => void remove(p.id)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar plano" : "Novo plano"}
      >
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <div className="mt-3">
          <Input
            label="Preço mensal"
            type="number"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(Number(e.target.value))}
          />
        </div>
        <label className="mt-3 block text-sm text-muted">
          Benefícios (um por linha)
          <textarea
            className="mt-1 min-h-[120px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={beneficios}
            onChange={(e) => setBeneficios(e.target.value)}
          />
        </label>
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
