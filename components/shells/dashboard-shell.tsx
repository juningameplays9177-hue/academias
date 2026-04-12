"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faRightFromBracket,
  faRightLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

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
    () => tenant?.nome ?? (isUltraAdmin ? "Plataforma" : "Beira Rio Fit"),
    [tenant?.nome, isUltraAdmin],
  );

  const headerTagline = useMemo(() => {
    if (tenant?.slug) return `${title} · @${tenant.slug}`;
    return title;
  }, [title, tenant?.slug]);

  useEffect(() => {
    document.title = `${brandName} · ${roleTag}`;
  }, [brandName, roleTag]);

  return (
    <div className="dark min-h-screen bg-black text-white">
      <div className="border-b border-orange-500/35 bg-gradient-to-r from-orange-600/30 via-transparent to-orange-500/10">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-xs text-neutral-200 sm:text-sm">
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
            {roleTag}
          </span>
          <span className="text-neutral-200">
            Painel interno · <span className="font-medium text-white">{brandName}</span>
            {tenant ? " — dados isolados desta unidade." : " — controle da rede."}
          </span>
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={basePath} className="flex flex-col leading-tight">
            <span className="max-w-[220px] truncate text-lg font-semibold tracking-tight text-white sm:max-w-[280px]">
              {brandName}
            </span>
            <span className="max-w-[220px] truncate text-[11px] text-neutral-400 sm:max-w-[320px]">
              {headerTagline}
            </span>
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
                    "flex items-center gap-2 transition hover:text-white",
                    active && "text-orange-400",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-xs opacity-80" />
                  {item.label}
                </Link>
              );
            })}
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
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-200 transition hover:border-orange-500/50 hover:text-white"
              >
                <FontAwesomeIcon icon={faRightLeft} className="text-[10px]" />
                Trocar academia
              </button>
            ) : null}
            <Link
              href="/site"
              className="transition hover:text-white"
            >
              Site
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 transition hover:border-orange-500/70 hover:text-white"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white"
              aria-label={openMenu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={openMenu}
              onClick={() => setOpenMenu((v) => !v)}
            >
              <FontAwesomeIcon icon={openMenu ? faXmark : faBars} />
            </button>
          </div>
        </div>

        {openMenu ? (
          <div className="border-t border-white/5 px-4 pb-4 lg:hidden">
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
                      active && "bg-orange-500/15 text-orange-300",
                    )}
                    onClick={() => setOpenMenu(false)}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/site"
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
                className="mt-2 w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => void logout()}
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                Sair
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <div className="mx-auto hidden max-w-6xl flex-wrap items-center justify-end gap-3 border-b border-white/5 px-4 py-2 text-xs text-neutral-400 lg:flex">
        <span>
          Logado como <span className="text-neutral-200">{user?.name ?? "—"}</span>
        </span>
        {tenant ? (
          <span className="text-neutral-500">
            ·{" "}
            <span className="text-orange-200/90">{tenant.nome}</span>
            <span className="text-neutral-600"> ({tenant.slug})</span>
          </span>
        ) : null}
      </div>

      <main className="min-h-[calc(100vh-8rem)] bg-black px-4 py-8 text-neutral-200 lg:px-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
