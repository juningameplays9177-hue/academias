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
import { paletteFromAcademyColors } from "@/lib/tenant/branding";
import { academiaPublicSitePath } from "@/lib/routes/academia-public-path";

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

type PublicAcademia = {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  cidade?: string | null;
  estado?: string | null;
  tagline?: string | null;
  corPrimaria?: string | null;
  corPrimariaSecundaria?: string | null;
  corPrimariaSuave?: string | null;
};

export function SelectAcademiaClient() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [choices, setChoices] = useState<TenantMembership[]>([]);
  const [publicAcademias, setPublicAcademias] = useState<PublicAcademia[]>([]);
  const [user, setUser] = useState<MeTenantChoices["user"] | null | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<string | null>(null);
  const [openingSite, setOpeningSite] = useState<string | null>(null);

  function openPublicSite(slug: string) {
    setOpeningSite(slug);
    try {
      router.push(academiaPublicSitePath(slug));
      router.refresh();
    } finally {
      setOpeningSite(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as MeTenantChoices;
        if (!res.ok) {
          if (!cancelled) {
            setUser(null);
            const pr = await fetch("/api/public/academias", { cache: "no-store" });
            if (!cancelled && pr.ok) {
              const pj = (await pr.json()) as { academias?: PublicAcademia[] };
              setPublicAcademias(pj.academias ?? []);
            }
          }
          return;
        }
        if (!cancelled) {
          setUser(data.user);
          if (data.user?.needsTenantSelection) {
            setChoices(data.user.memberships ?? []);
          } else if (!data.user) {
            const pr = await fetch("/api/public/academias", { cache: "no-store" });
            if (pr.ok) {
              const pj = (await pr.json()) as { academias?: PublicAcademia[] };
              if (!cancelled) setPublicAcademias(pj.academias ?? []);
            }
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          try {
            const pr = await fetch("/api/public/academias", { cache: "no-store" });
            if (!cancelled && pr.ok) {
              const pj = (await pr.json()) as { academias?: PublicAcademia[] };
              setPublicAcademias(pj.academias ?? []);
            }
          } catch {
            /* ignore */
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || user.needsTenantSelection) return;
    const role: RoleId = isRoleId(user.role) ? user.role : "aluno";
    router.replace(homePathForRole(role));
    router.refresh();
  }, [loading, user, router]);

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

  if (loading || user === undefined) {
    return (
      <p className="text-center text-sm text-neutral-500">Carregando…</p>
    );
  }

  if (user === null) {
    return (
      <section className="space-y-6">
        <div
          className="rounded-2xl border bg-gradient-to-r via-transparent to-transparent p-4 sm:p-5"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07), transparent, rgba(255,255,255,0.05))",
          }}
        >
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Passo 1 · Selecionar academia
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Em qual unidade você quer entrar?
            </h2>
            <p className="text-sm text-neutral-400">
              Toque em <span className="font-medium text-neutral-200">Entrar nesta academia</span>{" "}
              e faça login com e-mail e senha. Cada unidade mantém os dados separados.
            </p>
          </div>
        </div>

        {publicAcademias.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicAcademias.map((a) => {
              const { primary, secondary, soft } = paletteFromAcademyColors(
                a.corPrimaria,
                a.corPrimariaSecundaria,
                a.corPrimariaSuave,
              );
              return (
              <div
                key={a.id}
                className="flex flex-col rounded-2xl border bg-white/[0.06] p-5 shadow-xl backdrop-blur"
                style={{
                  borderColor: `color-mix(in srgb, ${soft} 55%, transparent)`,
                  backgroundImage: `linear-gradient(155deg, color-mix(in srgb, ${primary} 12%, transparent), rgba(0,0,0,0.12) 45%, color-mix(in srgb, ${secondary} 9%, transparent))`,
                  boxShadow: `0 1px 0 0 color-mix(in srgb, ${soft} 22%, transparent)`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${primary} 20%, transparent)`,
                      color: secondary,
                    }}
                  >
                    {a.logoUrl ? (
                      <img
                        src={a.logoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faBuilding} className="text-xl" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-white">{a.nome}</h3>
                    <p className="text-xs text-neutral-500">@{a.slug}</p>
                    {a.tagline ? (
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{a.tagline}</p>
                    ) : a.cidade ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        {a.cidade}
                        {a.estado ? ` · ${a.estado}` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href={`/login?unidade=${encodeURIComponent(a.slug)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
                    style={{ backgroundColor: primary }}
                  >
                    Entrar nesta academia
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white/25 text-neutral-100 hover:bg-white/10"
                    style={{
                      borderColor: `color-mix(in srgb, ${primary} 42%, transparent)`,
                    }}
                    disabled={openingSite !== null}
                    onClick={() => void openPublicSite(a.slug)}
                  >
                    {openingSite === a.slug ? "Abrindo site…" : "Ver site desta unidade"}
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-neutral-500">
            Não foi possível listar unidades ativas agora. Você ainda pode usar o{" "}
            <Link href="/login" className="font-medium text-neutral-200 underline decoration-white/30 hover:decoration-white/60">
              login direto
            </Link>{" "}
            ou o{" "}
            <Link href="/site" className="font-medium text-neutral-200 underline decoration-white/30 hover:decoration-white/60">
              site institucional
            </Link>
            .
          </p>
        )}
      </section>
    );
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
              <h2 className="truncate text-lg font-semibold text-white">
                {c.academiaNome}
              </h2>
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
  );
}
