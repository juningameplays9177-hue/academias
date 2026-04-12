"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
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
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl ring-1 ring-black/5">
      <div
        className="flex border-b border-neutral-200"
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
            "flex-1 px-4 py-3 text-sm font-medium transition",
            tab === "login"
              ? "border-b-2 border-orange-500 text-neutral-950"
              : "text-neutral-500 hover:text-neutral-800",
          )}
          onClick={() => setTab("login")}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "cadastro"}
          id="tab-cadastro"
          aria-controls="panel-cadastro"
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition",
            tab === "cadastro"
              ? "border-b-2 border-orange-500 text-neutral-950"
              : "text-neutral-500 hover:text-neutral-800",
          )}
          onClick={() => setTab("cadastro")}
        >
          Cadastro
        </button>
      </div>

      <div className="p-6">
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

      <div className="border-t border-neutral-200 bg-neutral-50/80 px-4 py-3">
        <Link
          href="/select-academia"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-orange-300 hover:bg-white hover:text-orange-800"
        >
          <FontAwesomeIcon icon={faBuilding} className="text-orange-600" />
          Voltar à seleção de academia
        </Link>
      </div>
    </div>
  );
}
