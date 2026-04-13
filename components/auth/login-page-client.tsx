"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { cn } from "@/lib/utils/cn";

type Tab = "login" | "cadastro";

export function LoginPageClient() {
  const [tab, setTab] = useState<Tab>("login");
  const [prefillEmail, setPrefillEmail] = useState("");

  const onRegistered = useCallback((email: string) => {
    setPrefillEmail(email);
    setTab("login");
  }, []);

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-xl ring-1 ring-border/60">
      <div className="border-b border-border bg-gradient-to-b from-card to-background px-5 pt-6">
        <div className="mb-5 flex flex-col items-center gap-2">
          <div className="rounded-2xl bg-tenant-shell-card px-4 py-3 shadow-md ring-1 ring-tenant-shell-border/40 sm:px-5 sm:py-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo em /public */}
            <img
              src="/branding/impulso-logo.png"
              alt="Impulso"
              width={260}
              height={78}
              decoding="async"
              fetchPriority="high"
              className="block h-auto w-40 max-w-full sm:w-44"
            />
          </div>
        </div>
        <div
          className="flex rounded-2xl bg-accent-soft/50 p-1 dark:bg-accent-soft/30"
          role="tablist"
          aria-label="Login ou cadastro"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            id="tab-login"
            aria-controls="panel-login"
            className={cn(
              "relative flex-1 overflow-hidden rounded-xl px-4 py-3 pb-3.5 text-sm font-semibold transition-all duration-200",
              tab === "login"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60 dark:bg-tenant-shell-card dark:ring-tenant-shell-border/40"
                : "text-muted hover:text-foreground",
            )}
            onClick={() => setTab("login")}
          >
            {tab === "login" ? (
              <span
                className="absolute inset-x-4 bottom-1 h-1 rounded-full bg-accent"
                aria-hidden
              />
            ) : null}
            <span className="relative z-[1]">Entrar</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "cadastro"}
            id="tab-cadastro"
            aria-controls="panel-cadastro"
            className={cn(
              "relative flex-1 overflow-hidden rounded-xl px-4 py-3 pb-3.5 text-sm font-semibold transition-all duration-200",
              tab === "cadastro"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60 dark:bg-tenant-shell-card dark:ring-tenant-shell-border/40"
                : "text-muted hover:text-foreground",
            )}
            onClick={() => setTab("cadastro")}
          >
            {tab === "cadastro" ? (
              <span
                className="absolute inset-x-4 bottom-1 h-1 rounded-full bg-accent"
                aria-hidden
              />
            ) : null}
            <span className="relative z-[1]">Cadastro</span>
          </button>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-8">
        {tab === "login" ? (
          <div id="panel-login" role="tabpanel" aria-labelledby="tab-login">
            <LoginForm initialEmail={prefillEmail} />
          </div>
        ) : (
          <div id="panel-cadastro" role="tabpanel" aria-labelledby="tab-cadastro">
            <RegisterForm onRegistered={onRegistered} />
          </div>
        )}
      </div>

      <p className="border-t border-border bg-card/80 px-5 py-4 text-center text-xs leading-relaxed text-muted sm:px-7 sm:text-sm dark:bg-card/60">
        <Link
          href="/select-academia"
          className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:brightness-110 hover:decoration-accent"
        >
          Escolher outra academia
        </Link>
        <span className="text-muted">
          {" "}
          — lista de unidades, entrar por outro link ou trocar de unidade antes de
          acessar.
        </span>
      </p>
    </div>
  );
}
