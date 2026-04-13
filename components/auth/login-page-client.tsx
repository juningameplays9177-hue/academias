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
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white text-[#0B0F1A] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset] ring-1 ring-black/5">
      <div className="border-b border-[#E5E7EB] bg-gradient-to-b from-[#F9FAFB] to-white px-5 pt-6">
        <div
          className="flex rounded-2xl bg-[#F3F4F6] p-1"
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
                ? "bg-white text-[#0B0F1A] shadow-md shadow-[#1E3A8A]/10"
                : "text-[#374151] hover:text-[#0B0F1A]",
            )}
            onClick={() => setTab("login")}
          >
            {tab === "login" ? (
              <span
                className="absolute inset-x-4 bottom-1 h-1 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#22D3EE] to-[#FACC15]"
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
                ? "bg-white text-[#0B0F1A] shadow-md shadow-[#1E3A8A]/10"
                : "text-[#374151] hover:text-[#0B0F1A]",
            )}
            onClick={() => setTab("cadastro")}
          >
            {tab === "cadastro" ? (
              <span
                className="absolute inset-x-4 bottom-1 h-1 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#22D3EE] to-[#FACC15]"
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

      <p className="border-t border-[#E5E7EB] bg-[#F9FAFB]/80 px-5 py-4 text-center text-xs leading-relaxed text-[#374151] sm:px-7 sm:text-sm">
        <Link
          href="/select-academia"
          className="font-semibold text-[#1E3A8A] underline decoration-[#3B82F6]/40 underline-offset-2 transition hover:text-[#3B82F6] hover:decoration-[#22D3EE]"
        >
          Escolher outra academia
        </Link>
        <span className="text-[#6B7280]">
          {" "}
          — lista de unidades, entrar por outro link ou trocar de unidade antes de
          acessar.
        </span>
      </p>
    </div>
  );
}
