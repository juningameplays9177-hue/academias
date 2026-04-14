import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { SelectAcademiaPublicCard } from "@/lib/tenant/select-academia-types";

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      />
    </svg>
  );
}

/** Grade do hub no servidor: aparece no HTML mesmo sem JavaScript (evita “Carregando…” na CDN). */
export function SelectAcademiaPublicGrid({
  academias,
}: {
  academias: SelectAcademiaPublicCard[];
}) {
  if (!academias.length) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Escolha sua academia
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Não há unidades disponíveis no momento. Entre com seu acesso ou tente mais tarde.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {academias.map((a) => (
          <div
            key={a.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-neutral-300">
                <BuildingIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-white">{a.nome}</h3>
                <p className="text-xs text-neutral-500">@{a.slug}</p>
                {a.cidade || a.estado ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    {[a.cidade, a.estado].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
            <Link
              href={`/login?unidade=${encodeURIComponent(a.slug)}`}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-0",
              )}
            >
              Entrar nesta academia
              <span aria-hidden className="text-xs">
                →
              </span>
            </Link>
            <Link
              href={`/a/${encodeURIComponent(a.slug)}`}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver site desta unidade
            </Link>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-neutral-500">
        Já tem sessão?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-300 underline-offset-2 hover:text-white hover:underline"
        >
          Ir direto ao login
        </Link>
      </p>
    </div>
  );
}
