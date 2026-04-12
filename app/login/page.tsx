import { Suspense } from "react";
import Link from "next/link";
import { LoginPageClient } from "@/components/auth/login-page-client";

function LoginFallback() {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-neutral-300 bg-white p-6 text-sm text-neutral-600 shadow-xl">
      Carregando…
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md space-y-4 text-white">
          <div className="space-y-2">
            <Link
              href="/select-academia"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-orange-200 transition hover:border-orange-500/50 hover:bg-white/10 hover:text-white"
            >
              ← Voltar à seleção de academia
            </Link>
            <p className="text-xs text-neutral-500">
              Escolha unidade, acesse o site institucional ou faça login por aqui.
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Beira Rio Fit · Login e cadastro
          </h1>
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
