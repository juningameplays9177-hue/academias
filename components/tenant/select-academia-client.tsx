"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBuilding } from "@fortawesome/free-solid-svg-icons";
import type { TenantMembership } from "@/lib/auth/session-cookie";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/contexts/toast-context";
import { homePathForRole } from "@/lib/rbac/home-path";
import { isRoleId, type RoleId } from "@/lib/rbac/roles";

type MeTenantChoices = {
  user: {
    id: string;
    email: string;
    name?: string;
    role: RoleId;
    needsTenantSelection?: boolean;
    memberships?: TenantMembership[];
  } | null;
};

export type PublicAcademia = {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  cidade: string | null;
  estado: string | null;
  tagline: string | null;
};

export type SelectAcademiaInitialMeUser = NonNullable<MeTenantChoices["user"]>;

const FETCH_MS = 25_000;

function fetchNoStore(url: string) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), FETCH_MS);
  return fetch(url, { cache: "no-store", signal: ctrl.signal }).finally(() =>
    clearTimeout(tid),
  );
}

type Props = {
  initialAcademias: PublicAcademia[];
  /** `null` = visitante (cookie sem sessão válida). */
  initialMeUser: SelectAcademiaInitialMeUser | null;
};

export function SelectAcademiaClient({ initialAcademias, initialMeUser }: Props) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [choices, setChoices] = useState<TenantMembership[]>(() =>
    initialMeUser?.needsTenantSelection ? (initialMeUser.memberships ?? []) : [],
  );
  const [user, setUser] = useState<MeTenantChoices["user"] | null>(() => initialMeUser);
  const [picking, setPicking] = useState<string | null>(null);
  const [publicAcademias, setPublicAcademias] = useState<PublicAcademia[]>(
    () => initialAcademias,
  );

  /** Sincroniza com as APIs quando a rede/CDN permite (SSR já mostrou a lista). */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [pubRes, meRes] = await Promise.all([
          fetchNoStore("/api/public/academias"),
          fetchNoStore("/api/auth/me"),
        ]);
        if (cancelled) return;
        if (pubRes.ok) {
          try {
            const pubData = (await pubRes.json()) as { academias?: PublicAcademia[] };
            setPublicAcademias(pubData.academias ?? []);
          } catch {
            /* mantém SSR */
          }
        }
        if (meRes.ok) {
          try {
            const meData = (await meRes.json()) as MeTenantChoices;
            if (meData.user) {
              setUser(meData.user);
              if (meData.user.needsTenantSelection) {
                setChoices(meData.user.memberships ?? []);
              } else {
                setChoices([]);
              }
            } else {
              setUser(null);
              setChoices([]);
            }
          } catch {
            /* mantém SSR */
          }
        }
      } catch {
        /* timeout / rede — dados do servidor permanecem */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user || user.needsTenantSelection) return;
    const role: RoleId = isRoleId(user.role) ? user.role : "aluno";
    router.replace(homePathForRole(role));
    router.refresh();
  }, [user, router]);

  async function pick(academiaId: string) {
    setPicking(academiaId);
    try {
      const res = await fetch("/api/auth/select-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academiaId }),
      });
      const body = (await res.json()) as { redirectTo?: string; error?: string };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Não foi possível entrar",
          description: body.error,
        });
        return;
      }
      pushToast({
        type: "success",
        title: "Unidade selecionada",
        description: "Carregando seu painel…",
      });
      router.replace(body.redirectTo ?? "/admin");
      router.refresh();
    } finally {
      setPicking(null);
    }
  }

  if (user && !user.needsTenantSelection) {
    return (
      <p className="text-center text-sm text-neutral-500">Redirecionando…</p>
    );
  }

  if (user && user.needsTenantSelection) {
    if (!choices.length) {
      return (
        <div className="space-y-4 text-center">
          <p className="text-sm text-neutral-500">
            Nenhuma academia disponível para este login.
          </p>
          <Link
            href="/login"
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10",
            )}
          >
            Voltar ao login
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Escolha a unidade
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Selecione em qual academia deseja entrar agora.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {choices.map((c) => (
            <div
              key={c.academiaId}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-neutral-300">
                  <FontAwesomeIcon icon={faBuilding} className="text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold text-white">
                    {c.academiaNome}
                  </h3>
                  <p className="text-xs text-neutral-500">@{c.slug}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    {c.role === "aluno"
                      ? "Aluno"
                      : c.role === "professor"
                        ? "Professor"
                        : c.role === "admin"
                          ? "Administração"
                          : c.role}
                  </p>
                  {c.displayName ? (
                    <p className="mt-1 truncate text-sm text-neutral-300">{c.displayName}</p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                className="mt-5 w-full gap-2"
                disabled={picking !== null}
                onClick={() => void pick(c.academiaId)}
              >
                {picking === c.academiaId ? (
                  "Entrando…"
                ) : (
                  <>
                    Entrar nesta academia
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Visitante: lista pública → login com ?unidade=slug */
  if (!publicAcademias.length) {
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
        {publicAcademias.map((a) => (
          <div
            key={a.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-neutral-300">
                <FontAwesomeIcon icon={faBuilding} className="text-lg" />
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
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
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
        <Link href="/login" className="font-medium text-neutral-300 underline-offset-2 hover:text-white hover:underline">
          Ir direto ao login
        </Link>
      </p>
    </div>
  );
}
