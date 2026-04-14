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

const FETCH_MS = 25_000;

function fetchNoStore(url: string) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), FETCH_MS);
  return fetch(url, { cache: "no-store", signal: ctrl.signal }).finally(() =>
    clearTimeout(tid),
  );
}

type MeUser = {
  id: string;
  email: string;
  name?: string;
  role: RoleId;
  needsTenantSelection?: boolean;
  memberships?: TenantMembership[];
};

type MeTenantChoices = { user: MeUser | null };

export type SelectAcademiaMultiInitialUser = MeUser;

type Props = {
  initialUser: SelectAcademiaMultiInitialUser;
};

/** Fluxo “e-mail em várias academias”: escolha de unidade após login (precisa de JS). */
export function SelectAcademiaMultiClient({ initialUser }: Props) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [choices, setChoices] = useState<TenantMembership[]>(() =>
    initialUser.needsTenantSelection ? (initialUser.memberships ?? []) : [],
  );
  const [user, setUser] = useState<MeUser | null>(() => initialUser);
  const [picking, setPicking] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const meRes = await fetchNoStore("/api/auth/me");
        if (cancelled || !meRes.ok) return;
        const meData = (await meRes.json()) as MeTenantChoices;
        if (meData.user) {
          setUser(meData.user);
          if (meData.user.needsTenantSelection) {
            setChoices(meData.user.memberships ?? []);
          } else {
            setChoices([]);
          }
        }
      } catch {
        /* mantém SSR */
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
