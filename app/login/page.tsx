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
      className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm"
      role="status"
      aria-label="Carregando formulário"
    >
      <div className="mx-auto h-10 w-48 animate-pulse rounded-lg bg-[#E5E7EB]" />
      <div className="mt-8 space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-[#E5E7EB]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#E5E7EB]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#E5E7EB]/80" />
      </div>
    </div>
  );
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const nome = await resolveLoginAcademiaNome(sp);
  const { h1 } = loginPageTitleParts(nome);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0F1A] px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-[#1E3A8A]/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-[#3B82F6]/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22D3EE]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <header className="w-full max-w-xl text-center lg:max-w-lg lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/branding/impulso-logo.png"
              alt="Impulso"
              width={320}
              height={96}
              priority
              className="h-auto w-[min(100%,220px)] sm:w-64"
            />
          </div>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {h1}
          </h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-[#22D3EE]/95 sm:text-lg">
            Tecnologia que impulsiona o crescimento das academias.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-[#E5E7EB]/85 sm:text-[0.9375rem]">
            Entre com sua conta ou cadastre-se como aluno. Equipe e administração
            continuam com os e-mails já configurados.
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
