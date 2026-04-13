"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faMoneyBillWave,
  faRightFromBracket,
  faRightLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { tenantTheme } from "@/lib/tenant/theme";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: IconDefinition;
};

type Props = {
  title: string;
  subtitle?: string;
  nav: DashboardNavItem[];
  /** Itens extras à esquerda (ex.: link “Ultra” no painel admin). */
  prependNav?: DashboardNavItem[];
  basePath: string;
  children: React.ReactNode;
};

/** Mesmo visual da página pública: preto, laranja, branco + header fixo estilo site */
export function DashboardShell({
  title,
  subtitle,
  nav,
  prependNav = [],
  basePath,
  children,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, logout, canSwitchTenant, isUltraAdmin, refresh } = useAuth();
  const showTrocarAcademia =
    Boolean(user?.canSwitchTenant) || (user?.memberships?.length ?? 0) > 1;
  const [openMenu, setOpenMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function switchAcademia() {
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/clear-tenant", { method: "POST" });
      if (!res.ok) return;
      await refresh();
      router.push("/select-academia");
      router.refresh();
    } finally {
      setSwitching(false);
    }
  }
  const roleTag = subtitle ?? "Painel";
  const allNav = [...prependNav, ...nav];

  const brandName = useMemo(
    () => tenant?.nome ?? (isUltraAdmin ? "Plataforma" : "Academia"),
    [tenant?.nome, isUltraAdmin],
  );

  const headerTagline = useMemo(() => {
    if (tenant?.tagline) return tenant.tagline;
    if (tenant?.slug) return `${title} · @${tenant.slug}`;
    return title;
  }, [title, tenant?.slug, tenant?.tagline]);

  const { primary, secondary, soft } = useMemo(() => tenantTheme(tenant), [tenant]);

  return (
    <div className="dark min-h-screen bg-tenant-shell-bg text-tenant-shell-fg">
      <div
        className="border-b bg-gradient-to-r via-transparent to-transparent"
        style={{
          borderColor: `${soft}88`,
          backgroundImage: `linear-gradient(to right, ${primary}38, transparent, ${secondary}22)`,
        }}
      >
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-xs text-neutral-200 sm:text-sm">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black"
            style={{ backgroundColor: primary }}
          >
            {roleTag}
          </span>
          <span className="text-neutral-200">
            {tenant
              ? "Painel interno · informações isoladas nesta unidade."
              : isUltraAdmin
                ? "Painel interno · visão da rede de academias."
                : "Painel interno · aguardando contexto de unidade."}
          </span>
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-tenant-shell-border/60 bg-tenant-shell-card/85 backdrop-blur">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4">
          <Link
            href={basePath}
            className={cn(
              "group flex min-w-0 max-w-[min(100%,26rem)] shrink items-center gap-3 rounded-xl py-1 pr-2 transition sm:max-w-[min(100%,28rem)] sm:gap-3.5 sm:pr-3",
              "outline-none hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[color:var(--tenant-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
            )}
          >
            {tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl border object-cover shadow-lg transition duration-300 group-hover:scale-[1.02] sm:h-12 sm:w-12"
                style={{
                  borderColor: `color-mix(in srgb, ${soft} 55%, transparent)`,
                  boxShadow: `0 6px 24px -8px color-mix(in srgb, ${primary} 50%, transparent)`,
                }}
              />
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-base font-bold tabular-nums text-black sm:h-12 sm:w-12 sm:text-lg"
                style={
                  tenant
                    ? {
                        borderColor: `color-mix(in srgb, ${soft} 50%, transparent)`,
                        background: `linear-gradient(145deg, color-mix(in srgb, ${primary} 92%, white), color-mix(in srgb, ${primary} 65%, #171717))`,
                        boxShadow: `0 6px 22px -6px color-mix(in srgb, ${primary} 55%, transparent)`,
                      }
                    : {
                        borderColor: "rgba(255,255,255,0.12)",
                        background: "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                        boxShadow: "none",
                      }
                }
                aria-hidden
              >
                <span className={tenant ? "" : "text-neutral-200"}>
                  {brandName.trim().slice(0, 1).toLocaleUpperCase("pt-BR")}
                </span>
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="min-w-0 truncate text-lg font-bold leading-tight tracking-tight text-white sm:text-xl"
                  style={
                    tenant
                      ? {
                          textShadow: `0 1px 0 rgba(0,0,0,0.45), 0 0 22px color-mix(in srgb, ${primary} 38%, transparent)`,
                        }
                      : { textShadow: "0 1px 0 rgba(0,0,0,0.4)" }
                  }
                >
                  {brandName}
                </span>
                {tenant?.slug ? (
                  <span
                    className="hidden shrink-0 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-wide text-neutral-400 sm:inline-flex"
                    title={tenant.slug}
                  >
                    @{tenant.slug}
                  </span>
                ) : null}
              </div>
              <span className="line-clamp-1 text-[11px] font-medium text-neutral-500 sm:text-xs sm:text-neutral-400">
                {headerTagline}
              </span>
            </div>
          </Link>

          <nav
            className="hidden shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-neutral-300 lg:flex"
            aria-label="Principal"
          >
            {allNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== basePath && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 transition hover:text-tenant-shell-fg",
                    active && "text-[color:var(--tenant-primary)]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-xs opacity-80" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/mensalidade"
              className={cn(
                "flex items-center gap-2 transition hover:text-tenant-shell-fg",
                pathname === "/mensalidade" && "text-[color:var(--tenant-primary)]",
              )}
              aria-current={pathname === "/mensalidade" ? "page" : undefined}
            >
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs opacity-80" />
              Mensalidade
            </Link>
            {isUltraAdmin && tenant ? (
              <Link
                href="/ultra-admin"
                className="text-xs text-violet-300 transition hover:text-violet-100"
              >
                Trocar unidade
              </Link>
            ) : null}
            {showTrocarAcademia ? (
              <button
                type="button"
                disabled={switching}
                onClick={() => void switchAcademia()}
                className="flex items-center gap-1.5 rounded-full border border-tenant-shell-border/40 px-3 py-1 text-xs text-neutral-200 transition hover:border-tenant-shell-border/60 hover:text-tenant-shell-fg"
              >
                <FontAwesomeIcon icon={faRightLeft} className="text-[10px]" />
                Trocar academia
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-2 rounded-full border border-tenant-shell-border/35 px-3 py-1 text-xs text-neutral-200 transition hover:border-tenant-shell-border/55 hover:text-tenant-shell-fg"
              aria-label="Sair da conta"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              Sair
            </button>
          </nav>

          <div className="flex min-w-0 shrink-0 items-center gap-2 lg:hidden">
            {showTrocarAcademia ? (
              <button
                type="button"
                disabled={switching}
                onClick={() => void switchAcademia()}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-tenant-shell-border/40 px-2.5 py-1.5 text-[11px] font-medium text-neutral-200 transition hover:border-tenant-shell-border/60 hover:text-tenant-shell-fg"
                aria-label="Trocar de academia"
                title="Trocar de academia"
              >
                <FontAwesomeIcon icon={faRightLeft} className="text-[10px]" />
                <span className="hidden sm:inline">Trocar</span>
              </button>
            ) : null}
            <span className="max-w-[72px] truncate text-xs text-neutral-400 sm:max-w-[100px]">
              {user?.name?.split(" ")[0] ?? "—"}
            </span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-tenant-shell-border/35 text-tenant-shell-fg"
              aria-label={openMenu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={openMenu}
              onClick={() => setOpenMenu((v) => !v)}
            >
              <FontAwesomeIcon icon={openMenu ? faXmark : faBars} />
            </button>
          </div>
        </div>

        {openMenu ? (
          <div className="border-t border-tenant-shell-border/25 px-4 pb-4 lg:hidden">
            <div className="mt-3 flex flex-col gap-1 text-sm">
              {allNav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== basePath && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-200 hover:bg-white/5",
                      active && "bg-white/10 text-[color:var(--tenant-primary)]",
                    )}
                    onClick={() => setOpenMenu(false)}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/mensalidade"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-200 hover:bg-white/5",
                  pathname === "/mensalidade" &&
                    "bg-white/10 text-[color:var(--tenant-primary)]",
                )}
                onClick={() => setOpenMenu(false)}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} className="w-4" />
                Mensalidade
              </Link>
              {showTrocarAcademia ? (
                <button
                  type="button"
                  disabled={switching}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-neutral-200 hover:bg-white/5"
                  onClick={() => {
                    void switchAcademia();
                    setOpenMenu(false);
                  }}
                >
                  <FontAwesomeIcon icon={faRightLeft} className="w-4" />
                  Trocar academia
                </button>
              ) : null}
              {isUltraAdmin && tenant ? (
                <Link
                  href="/ultra-admin"
                  className="rounded-lg px-3 py-2.5 text-sm text-violet-300 hover:bg-white/5"
                  onClick={() => setOpenMenu(false)}
                >
                  Trocar unidade (Ultra)
                </Link>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full border-tenant-shell-border/45 text-tenant-shell-fg hover:bg-tenant-shell-fg/10"
                onClick={() => void logout()}
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                Sair
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <div className="mx-auto hidden max-w-6xl flex-wrap items-center justify-end gap-3 border-b border-tenant-shell-border/25 px-4 py-2 text-xs text-neutral-400 lg:flex">
        <span>
          Logado como <span className="text-neutral-200">{user?.name ?? "—"}</span>
        </span>
        {tenant ? (
          <span className="text-neutral-500">
            ·{" "}
            <span className="text-[color:var(--tenant-primary)]">{tenant.nome}</span>
            <span className="text-neutral-600"> ({tenant.slug})</span>
          </span>
        ) : null}
      </div>

      <main className="min-h-[calc(100vh-8rem)] bg-transparent px-4 py-8 text-neutral-200 lg:px-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
