import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginPageClient } from "@/components/auth/login-page-client";
import {
  loginPageTitleParts,
  resolveLoginAcademiaNome,
} from "@/lib/auth/login-page-academia";

type Props = { searchParams?: Promise<{ unidade?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const nome = await resolveLoginAcademiaNome(sp);
  const { title } = loginPageTitleParts(nome);
  return { title, description: "Entre ou cadastre-se na unidade selecionada." };
}

function LoginFallback() {
  return (
    <div
      className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card/95 p-8 shadow-xl backdrop-blur-sm"
      role="status"
      aria-label="Carregando formulário"
    >
      <div className="mx-auto h-10 w-48 animate-pulse rounded-lg bg-muted/30" />
      <div className="mt-8 space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-muted/30" />
        <div className="h-12 animate-pulse rounded-xl bg-muted/30" />
        <div className="h-12 animate-pulse rounded-xl bg-muted/20" />
      </div>
    </div>
  );
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const nome = await resolveLoginAcademiaNome(sp);
  const { h1 } = loginPageTitleParts(nome);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-tenant-secondary/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <header className="w-full max-w-xl text-center lg:max-w-lg lg:text-left">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <div className="inline-flex rounded-2xl bg-card px-5 py-4 shadow-lg ring-1 ring-border sm:px-7 sm:py-5 dark:bg-tenant-shell-card dark:ring-tenant-shell-border/50">
              <Image
                src="/branding/impulso-logo.png"
                alt="Impulso — tecnologia para academias"
                width={320}
                height={96}
                priority
                className="h-auto w-[min(100%,240px)] sm:w-72"
              />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Impulso
            </p>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:mt-8 sm:text-3xl">
            {h1}
          </h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-muted sm:text-lg">
            Tecnologia que impulsiona o crescimento das academias.
          </p>
        </header>

        <div className="flex w-full max-w-md flex-1 justify-center lg:justify-end">
          <Suspense fallback={<LoginFallback />}>
            <LoginPageClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
