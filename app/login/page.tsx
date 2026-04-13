import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
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
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-neutral-300 bg-white p-6 text-sm text-neutral-600 shadow-xl">
      Carregando…
    </div>
  );
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const nome = await resolveLoginAcademiaNome(sp);
  const { h1 } = loginPageTitleParts(nome);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md space-y-4 text-white">
          <div>
            <Link
              href="/select-academia"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              ← Voltar à seleção de academia
            </Link>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{h1}</h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            Entre com sua conta ou cadastre-se como aluno. Equipe e administração
            continuam com os e-mails já configurados.
          </p>
        </div>
        <div className="w-full max-w-md">
          <Suspense fallback={<LoginFallback />}>
            <LoginPageClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
