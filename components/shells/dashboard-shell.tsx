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
            Painel interno · <span className="font-medium text-tenant-shell-fg">{brandName}</span>
            {tenant ? " — dados isolados desta unidade." : " — controle da rede."}
          </span>
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-tenant-shell-border/60 bg-tenant-shell-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={basePath} className="flex min-w-0 items-center gap-3 leading-tight">
            {tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-tenant-shell-border/40 object-cover"
              />
            ) : null}
            <div className="flex min-w-0 flex-col">
              <span className="max-w-[220px] truncate text-lg font-semibold tracking-tight text-tenant-shell-fg sm:max-w-[280px]">
                {brandName}
              </span>
              <span className="max-w-[220px] truncate text-[11px] text-neutral-400 sm:max-w-[320px]">
                {headerTagline}
              </span>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-5 text-sm text-neutral-300 lg:flex"
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
            {canSwitchTenant ? (
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
            <Link
              href={
                tenant?.slug
                  ? `/site?unidade=${encodeURIComponent(tenant.slug)}`
                  : "/site"
              }
              className="transition hover:text-tenant-shell-fg"
            >
              Site
            </Link>
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

          <div className="flex items-center gap-2 lg:hidden">
            <span className="max-w-[100px] truncate text-xs text-neutral-400">
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
              <Link
                href={
                  tenant?.slug
                    ? `/site?unidade=${encodeURIComponent(tenant.slug)}`
                    : "/site"
                }
                className="rounded-lg px-3 py-2.5 text-neutral-200 hover:bg-white/5"
                onClick={() => setOpenMenu(false)}
              >
                Ver site público
              </Link>
              {canSwitchTenant ? (
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
