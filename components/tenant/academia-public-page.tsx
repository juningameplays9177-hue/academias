"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { useAuth } from "@/hooks/useAuth";

type Props = { slug: string };

/**
 * Define o cookie de tenant pela rota `/a/[slug]` e exibe o site institucional daquela unidade.
 */
export function AcademiaPublicPage({ slug }: Props) {
  const { refresh } = useAuth();
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug.trim()) {
      setPhase("error");
      setError("Slug inválido.");
      return;
    }
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await fetch("/api/public/visitor-tenant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ slug: slug.trim() }),
          signal: ac.signal,
        });
        const j = (await res.json()) as { error?: string };
        if (!res.ok) {
          if (!ac.signal.aborted) {
            setError(j.error ?? "Não foi possível abrir esta unidade.");
            setPhase("error");
          }
          return;
        }
        await refresh();
        if (!ac.signal.aborted) setPhase("ready");
      } catch {
        if (!ac.signal.aborted) {
          setError("Falha de rede ao carregar a unidade.");
          setPhase("error");
        }
      }
    })();
    return () => ac.abort();
  }, [slug, refresh]);

  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-tenant-shell-bg px-6 text-center text-tenant-shell-fg">
        <p className="max-w-md text-sm text-neutral-300">{error}</p>
        <Link
          href="/select-academia"
          className="rounded-full border border-tenant-shell-border/40 px-5 py-2 text-sm text-neutral-200 hover:bg-tenant-shell-fg/10"
        >
          Voltar ao hub de academias
        </Link>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tenant-shell-bg text-neutral-400">
        Carregando site da unidade…
      </div>
    );
  }

  return <MarketingPage />;
}
