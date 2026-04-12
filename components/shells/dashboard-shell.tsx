"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faRightFromBracket,
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
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const roleTag = subtitle ?? "Painel";
  const allNav = [...prependNav, ...nav];

  return (
    <div className="dark min-h-screen bg-black text-white">
      <div className="border-b border-orange-500/35 bg-gradient-to-r from-orange-600/30 via-transparent to-orange-500/10">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-xs text-neutral-200 sm:text-sm">
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
            {roleTag}
          </span>
          Sistema interno Beira Rio Fit — mesmo padrão visual do site público.
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={basePath} className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight text-white">
              Beira Rio Fit
            </span>
            <span className="text-[11px] text-neutral-400">
              {title} · Recreio
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
            <Link
              href="/"
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
                href="/"
                className="rounded-lg px-3 py-2.5 text-neutral-200 hover:bg-white/5"
                onClick={() => setOpenMenu(false)}
              >
                Ver site público
              </Link>
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

      <div className="mx-auto hidden max-w-6xl items-center justify-end gap-3 border-b border-white/5 px-4 py-2 text-xs text-neutral-400 lg:flex">
        <span>
          Logado como <span className="text-neutral-200">{user?.name ?? "—"}</span>
        </span>
      </div>

      <main className="min-h-[calc(100vh-8rem)] bg-black px-4 py-8 text-neutral-200 lg:px-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
