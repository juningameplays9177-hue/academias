"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/hooks/useAuth";

type Academia = {
  id: string;
  nome: string;
  slug: string;
  status: string;
  plataformaDesligada?: boolean;
};

export function UltraAssumeTenant() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { refresh } = useAuth();
  const [list, setList] = useState<Academia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/academias", { cache: "no-store" });
        const j = (await res.json()) as { academias?: Academia[] };
        if (!cancelled && res.ok) setList(j.academias ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function assume(id: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/ultra-admin/assume-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academiaId: id }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        pushToast({ type: "error", title: "Erro", description: j.error });
        return;
      }
      await refresh();
      pushToast({
        type: "success",
        title: "Unidade definida",
        description: "Abrindo o painel admin desta academia.",
      });
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-neutral-500">Carregando academias da rede…</p>
    );
  }

  return (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-5">
      <h2 className="text-base font-semibold text-white">Operar como gestor de unidade</h2>
      <p className="mt-1 text-sm text-neutral-400">
        Escolha a academia para carregar o painel <strong className="text-neutral-200">Admin</strong>{" "}
        com dados isolados dessa unidade (cookie de tenant).
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {list
          .filter((a) => a.status === "ativo")
          .map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FontAwesomeIcon icon={faBuilding} className="text-violet-300" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{a.nome}</p>
                  <p className="text-xs text-neutral-500">@{a.slug}</p>
                  {a.plataformaDesligada ? (
                    <p className="mt-1 text-[11px] font-medium text-orange-300">
                      Plataforma suspensa — você ainda pode operar como Ultra
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={busy !== null}
                onClick={() => void assume(a.id)}
                className="shrink-0 gap-1"
              >
                {busy === a.id ? "…" : (
                  <>
                    Admin
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                  </>
                )}
              </Button>
            </li>
          ))}
      </ul>
    </div>
  );
}
