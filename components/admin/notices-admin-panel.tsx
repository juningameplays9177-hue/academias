"use client";

import { useCallback, useEffect, useState } from "react";
import type { NoticeRecord, NoticeTarget } from "@/lib/db/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";

export function NoticesAdminPanel() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState<NoticeRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [destino, setDestino] = useState<NoticeTarget>("alunos");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/notices", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { notices: NoticeRecord[] };
      setRows(data.notices);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, corpo, destino }),
      });
      if (!res.ok) {
        pushToast({ type: "error", title: "Não publicou" });
        return;
      }
      pushToast({
        type: "success",
        title: "Aviso publicado",
        description: "Alunos/professores veem na próxima carga do painel.",
      });
      setOpen(false);
      setTitulo("");
      setCorpo("");
      setDestino("alunos");
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Avisos" },
        ]}
      />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Avisos</h1>
          <p className="mt-1 text-sm text-muted">
            Comunicado rápido — aparece no topo dos painéis conforme o público.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          Novo aviso
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((n) => (
          <article
            key={n.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{n.titulo}</h2>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                {n.destino}
              </span>
            </header>
            <p className="mt-2 text-sm text-muted">{n.corpo}</p>
            <p className="mt-3 text-xs text-zinc-500">
              {new Date(n.criadoEm).toLocaleString("pt-BR")}
            </p>
          </article>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo aviso">
        <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <label className="mt-3 block text-sm text-muted">
          Corpo
          <textarea
            className="mt-1 min-h-[120px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm text-muted">
          Destino
          <select
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            value={destino}
            onChange={(e) => setDestino(e.target.value as NoticeTarget)}
          >
            <option value="alunos">Alunos</option>
            <option value="professores">Professores</option>
            <option value="todos">Todos</option>
          </select>
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
