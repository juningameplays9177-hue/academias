"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faIdCard,
  faPhone,
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";

const inputShell =
  "w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-3 text-sm text-[#0B0F1A] shadow-sm outline-none transition placeholder:text-[#6B7280] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20";

type Props = {
  onRegistered: (email: string) => void;
};

export function RegisterForm({ onRegistered }: Props) {
  const { pushToast } = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [celular, setCelular] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      pushToast({
        type: "error",
        title: "Senhas diferentes",
        description: "Repita a mesma senha nos dois campos.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha,
          confirmarSenha,
          cpf,
          celular,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Cadastro não concluído",
          description: body.error,
        });
        return;
      }
      pushToast({
        type: "success",
        title: "Conta criada",
        description: body.message,
      });
      const normalized = email.trim().toLowerCase();
      onRegistered(normalized);
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
      setCpf("");
      setCelular("");
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
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#0B0F1A]">
          Criar conta
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#374151]">
          Você entra como <strong className="font-semibold text-[#1E3A8A]">aluno</strong>{" "}
          no painel. A recepção confirma documentos depois.
        </p>
      </div>

      <label className="block text-sm" htmlFor="reg-nome">
        <span className="font-semibold text-[#374151]">Nome completo</span>
        <div className="relative mt-1.5">
          <FontAwesomeIcon
            icon={faUser}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
            aria-hidden
          />
          <input
            id="reg-nome"
            name="nome"
            type="text"
            autoComplete="name"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`${inputShell} pl-11 pr-4`}
            placeholder="Como no documento"
          />
        </div>
      </label>

      <label className="block text-sm" htmlFor="reg-email">
        <span className="font-semibold text-[#374151]">E-mail</span>
        <div className="relative mt-1.5">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
            aria-hidden
          />
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputShell} pl-11 pr-4`}
            placeholder="voce@email.com"
          />
        </div>
      </label>

      <label className="block text-sm" htmlFor="reg-senha">
        <span className="font-semibold text-[#374151]">Senha</span>
        <div className="relative mt-1.5">
          <FontAwesomeIcon
            icon={faLock}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
            aria-hidden
          />
          <input
            id="reg-senha"
            name="senha"
            type={showSenha ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={`${inputShell} pl-11 pr-12`}
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#E5E7EB]/80 hover:text-[#0B0F1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#3B82F6]"
            onClick={() => setShowSenha((v) => !v)}
            aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            <FontAwesomeIcon icon={showSenha ? faEyeSlash : faEye} className="h-4 w-4" />
          </button>
        </div>
      </label>

      <label className="block text-sm" htmlFor="reg-senha2">
        <span className="font-semibold text-[#374151]">Confirmar senha</span>
        <div className="relative mt-1.5">
          <FontAwesomeIcon
            icon={faLock}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
            aria-hidden
          />
          <input
            id="reg-senha2"
            name="confirmarSenha"
            type={showConfirmar ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className={`${inputShell} pl-11 pr-12`}
            placeholder="Digite a senha novamente"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-[#E5E7EB]/80 hover:text-[#0B0F1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#3B82F6]"
            onClick={() => setShowConfirmar((v) => !v)}
            aria-label={showConfirmar ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
          >
            <FontAwesomeIcon
              icon={showConfirmar ? faEyeSlash : faEye}
              className="h-4 w-4"
            />
          </button>
        </div>
      </label>

      <label className="block text-sm" htmlFor="reg-cpf">
        <span className="font-semibold text-[#374151]">CPF</span>
        <div className="relative mt-1.5">
          <FontAwesomeIcon
            icon={faIdCard}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
            aria-hidden
          />
          <input
            id="reg-cpf"
            name="cpf"
            inputMode="numeric"
            autoComplete="off"
            required
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className={`${inputShell} pl-11 pr-4`}
            placeholder="000.000.000-00"
          />
        </div>
      </label>

      <label className="block text-sm" htmlFor="reg-celular">
        <span className="font-semibold text-[#374151]">Celular (WhatsApp)</span>
        <div className="relative mt-1.5">
          <FontAwesomeIcon
            icon={faPhone}
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
            aria-hidden
          />
          <input
            id="reg-celular"
            name="celular"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            className={`${inputShell} pl-11 pr-4`}
            placeholder="(11) 98765-4321"
          />
        </div>
      </label>

      <Button
        type="submit"
        className="mt-3 w-full rounded-xl border-0 bg-gradient-to-r from-[#3B82F6] via-[#22D3EE] to-[#FACC15] py-3 text-sm font-semibold text-[#0B0F1A] shadow-lg shadow-[#3B82F6]/25 transition duration-200 hover:brightness-[1.03] hover:shadow-xl hover:shadow-[#22D3EE]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22D3EE] disabled:pointer-events-none disabled:opacity-55"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" aria-hidden />
            Cadastrando…
          </>
        ) : (
          "Cadastrar"
        )}
      </Button>
    </form>
  );
}
