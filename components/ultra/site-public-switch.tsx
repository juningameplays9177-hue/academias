"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/toast-context";

export function SitePublicSwitch() {
  const { pushToast } = useToast();
  const [off, setOff] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [patching, setPatching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ultra/platform", { cache: "no-store" });
        const j = (await res.json()) as { sitePublicoDesligado?: boolean };
        if (!cancelled && res.ok) setOff(Boolean(j.sitePublicoDesligado));
      } catch {
        if (!cancelled) setOff(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function apply(next: boolean) {
    setPatching(true);
    try {
      const res = await fetch("/api/ultra/platform", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitePublicoDesligado: next }),
      });
      const j = (await res.json()) as {
        sitePublicoDesligado?: boolean;
        error?: string;
      };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Não foi possível atualizar",
          description: j.error,
        });
        return;
      }
      setOff(Boolean(j.sitePublicoDesligado));
      pushToast({
        type: "success",
        title: next ? "Site público desligado" : "Site público religado",
        description: next
          ? "Apenas o Ultra Admin acessa painéis e APIs. Demais usuários veem a página de manutenção."
          : "Visitantes e demais perfis voltam ao normal.",
      });
    } finally {
      setPatching(false);
    }
  }

  if (loading || off === null) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-neutral-500">
        Carregando estado do site…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Site público</h2>
          <p className="mt-1 max-w-xl text-sm text-neutral-400">
            Com o site desligado, visitantes e todos os logins (admin, professor,
            aluno) ficam bloqueados — inclusive APIs.{" "}
            <strong className="text-orange-200">Só o Ultra Admin</strong> continua
            usando o sistema.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <span
            className={`text-center text-xs font-semibold uppercase tracking-wide ${
              off ? "text-red-300" : "text-emerald-300"
            }`}
          >
            {off ? "Desligado para todos" : "Operação normal"}
          </span>
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-white/15 bg-black/40 px-4 py-2.5 sm:justify-end">
            <span className="text-sm text-neutral-300">
              {off ? "Site desligado (desmarque para religar)" : "Desligar site"}
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-orange-500"
              checked={off}
              disabled={patching}
              onChange={(e) => void apply(e.target.checked)}
              aria-label="Desligar site público para todos exceto Ultra Admin"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
