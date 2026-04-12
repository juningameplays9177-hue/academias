"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import { DEMO_PASSWORD } from "@/lib/db/seed";

type Props = {
  initialEmail?: string;
};

function formatUnidadeLabel(slug: string) {
  return slug.replace(/-/g, " ");
}

export function LoginForm({ initialEmail = "" }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const { pushToast } = useToast();
  const unidadeSlug = params.get("unidade");
  const unidadeLabel = useMemo(
    () => (unidadeSlug ? formatUnidadeLabel(unidadeSlug) : ""),
    [unidadeSlug],
  );
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        needsTenantSelection?: boolean;
        redirectTo?: string;
        error?: string;
      };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Credenciais inválidas",
          description: body.error ?? "Confere e-mail e senha de novo.",
        });
        return;
      }
      pushToast({
        type: "success",
        title: "Sessão aberta",
        description: body.needsTenantSelection
          ? "Escolha em qual academia deseja entrar."
          : "Te jogando pro painel certo.",
      });
      if (body.needsTenantSelection) {
        router.replace("/select-academia");
        router.refresh();
        return;
      }
      const from = params.get("from");
      const target =
        body.redirectTo ??
        (from && !from.startsWith("/login") ? from : "/admin");
      router.replace(target);
      router.refresh();
    } catch {
      pushToast({
        type: "error",
        title: "Rede instável",
        description: "Tenta de novo daqui a pouco.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-neutral-400 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 shadow-inner outline-none placeholder:text-neutral-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          Entrar
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Use o e-mail e a senha da sua conta. Contas de admin/professor seguem o
          fluxo antigo; alunos cadastrados aqui usam a senha que você criou.
        </p>
        {unidadeSlug ? (
          <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50/90 px-3 py-2.5 text-sm text-orange-950">
            <p>
              <span className="font-medium">Unidade escolhida:</span>{" "}
              <span className="capitalize">{unidadeLabel}</span>
              <span className="ml-1 font-mono text-xs text-orange-800/90">
                ({unidadeSlug})
              </span>
            </p>
            <Link
              href="/select-academia"
              className="mt-1 inline-block text-xs font-medium text-orange-800 underline decoration-orange-400/60 hover:text-orange-950"
            >
              Escolher outra academia
            </Link>
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5 text-sm">
        <label htmlFor="login-email" className="font-medium text-neutral-800">
          E-mail
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            aria-hidden
          />
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder="voce@email.com"
            aria-label="E-mail"
          />
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <label htmlFor="login-password" className="font-medium text-neutral-800">
          Senha
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faLock}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            aria-hidden
          />
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            placeholder="••••••"
            aria-label="Senha"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Validando…" : "Entrar"}
      </Button>

      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-700">
        <p className="font-semibold text-neutral-900">Ambiente demo</p>
        <ul className="mt-2 space-y-1">
          <li>
            <span className="font-medium text-neutral-950">admin@academia.com</span>
            {" · "}
            <span className="font-medium text-neutral-950">
              professor@academia.com
            </span>
            {" · "}
            <span className="font-medium text-neutral-950">aluno@academia.com</span>
          </li>
          <li>
            <span className="font-medium text-neutral-950">multi@tenant.demo</span>
            {" — duas academias (mesma senha) · "}
            <code className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-[11px] text-orange-200">
              123456
            </code>
          </li>
          <li className="text-neutral-600">
            Senha padrão (demais contas demo):{" "}
            <code className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-[11px] text-orange-200">
              {DEMO_PASSWORD}
            </code>
          </li>
        </ul>
      </div>
    </form>
  );
}
