"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";

const fieldClass =
  "w-full rounded-lg border border-neutral-400 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-inner outline-none placeholder:text-neutral-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

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
        <h2 className="text-lg font-semibold text-neutral-950">Criar conta</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Você entra como <strong className="text-neutral-800">aluno</strong> no
          painel. A recepção confirma documentos depois.
        </p>
      </div>

      <label className="block text-sm" htmlFor="reg-nome">
        <span className="font-medium text-neutral-800">Nome completo</span>
        <input
          id="reg-nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={`mt-1 ${fieldClass}`}
          placeholder="Como no documento"
        />
      </label>

      <label className="block text-sm" htmlFor="reg-email">
        <span className="font-medium text-neutral-800">E-mail</span>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 ${fieldClass}`}
          placeholder="voce@email.com"
        />
      </label>

      <label className="block text-sm" htmlFor="reg-senha">
        <span className="font-medium text-neutral-800">Senha</span>
        <input
          id="reg-senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={`mt-1 ${fieldClass}`}
          placeholder="Mínimo 6 caracteres"
        />
      </label>

      <label className="block text-sm" htmlFor="reg-senha2">
        <span className="font-medium text-neutral-800">Confirmar senha</span>
        <input
          id="reg-senha2"
          name="confirmarSenha"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className={`mt-1 ${fieldClass}`}
          placeholder="Digite a senha novamente"
        />
      </label>

      <label className="block text-sm" htmlFor="reg-cpf">
        <span className="font-medium text-neutral-800">CPF</span>
        <input
          id="reg-cpf"
          name="cpf"
          inputMode="numeric"
          autoComplete="off"
          required
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className={`mt-1 ${fieldClass}`}
          placeholder="000.000.000-00"
        />
      </label>

      <label className="block text-sm" htmlFor="reg-celular">
        <span className="font-medium text-neutral-800">Celular (WhatsApp)</span>
        <input
          id="reg-celular"
          name="celular"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className={`mt-1 ${fieldClass}`}
          placeholder="(11) 98765-4321"
        />
      </label>

      <Button
        type="submit"
        className="mt-2 w-full"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Cadastrando…" : "Cadastrar"}
      </Button>
    </form>
  );
}
