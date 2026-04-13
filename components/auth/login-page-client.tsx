"use client";

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
    </div>
  );
}
