"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEnvelope,
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";

type Props = {
  initialEmail?: string;
};

function formatUnidadeLabel(slug: string) {
  return slug.replace(/-/g, " ");
}

const inputShell =
  "w-full rounded-xl border border-border bg-background py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 dark:bg-card";

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
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div>
        <p className="text-sm leading-relaxed text-muted">
          Digite o e-mail e a senha vinculados à sua conta na academia.
        </p>
        {unidadeSlug ? (
          <div className="mt-4 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-foreground shadow-sm">
            <p>
              <span className="font-semibold text-accent">Unidade escolhida:</span>{" "}
              <span className="capitalize text-foreground">{unidadeLabel}</span>
              <span className="ml-1 font-mono text-xs text-muted">
                ({unidadeSlug})
              </span>
            </p>
            <Link
              href="/select-academia"
              className="mt-2 inline-block text-xs font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:brightness-110"
            >
              Escolher outra academia
            </Link>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 text-sm">
        <label htmlFor="login-email" className="font-semibold text-foreground">
          E-mail
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
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
            className={`${inputShell} pl-11 pr-4`}
            placeholder="voce@email.com"
            aria-label="E-mail"
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label htmlFor="login-password" className="font-semibold text-foreground">
          Senha
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faLock}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputShell} pl-11 pr-12`}
            placeholder="••••••"
            aria-label="Senha"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-accent-soft hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full rounded-xl py-3 text-sm font-semibold"
      >
        {submitting ? (
          <>
            <FontAwesomeIcon
              icon={faSpinner}
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
            Validando…
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
