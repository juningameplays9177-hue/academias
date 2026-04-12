"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useAuth } from "@/hooks/useAuth";
import { homePathForRole } from "@/lib/rbac/home-path";
import {
  tenantPalette,
  whatsappHrefFromTelefoneWithText,
} from "@/lib/tenant/branding";

type PublicPlan = {
  id: string;
  nome: string;
  precoMensal: number;
  beneficios: string[];
  destaque?: boolean;
};

type PlanCard = {
  key: string;
  nome: string;
  preco: string;
  nota: string;
  itens: string[];
  destaque: boolean;
};

function defaultPlanCards(): PlanCard[] {
  return [
    {
      key: "off",
      nome: "Off-peak",
      preco: "R$ 129,90",
      nota: "Pra quem treina cedo ou no meio do dia.",
      itens: ["Seg–sex 6h–14h", "Avaliação física trimestral", "App com check-in"],
      destaque: false,
    },
    {
      key: "full",
      nome: "Full time",
      preco: "R$ 189,90",
      nota: "O mais escolhido — mistura bom senso com liberdade.",
      itens: ["Horário liberado", "1 aula extra / mês", "Armário médio incluso"],
      destaque: true,
    },
    {
      key: "perf",
      nome: "Performance",
      preco: "R$ 279,90",
      nota: "Quem quer coach no bolso (dentro do razoável).",
      itens: [
        "2 sessões com coach / mês",
        "Prioridade em turmas lotadas",
        "Nutrição básica no app",
      ],
      destaque: false,
    },
  ];
}

function payMessage(unidade: string, nomePlano: string, precoLabel: string) {
  return (
    `Olá! Quero pagar a mensalidade do plano "${nomePlano}" (${precoLabel}) na unidade ${unidade}. ` +
    "Pode me orientar sobre vencimento e forma de pagamento?"
  );
}

export function MensalidadePageClient() {
  const { user, tenant } = useAuth();
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  /** Atualiza só o telefone a partir do banco (sem disparar loading global do auth). */
  const [telefoneDb, setTelefoneDb] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as { tenant?: { telefone?: string | null } | null };
        if (!cancelled) setTelefoneDb(j.tenant?.telefone ?? null);
      } catch {
        if (!cancelled) setTelefoneDb(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/plans", { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as { plans?: PublicPlan[] };
        if (!cancelled) setPlans(j.plans ?? []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setPlansLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const planCards = useMemo((): PlanCard[] => {
    if (plans.length) {
      return plans.map((p) => ({
        key: p.id,
        nome: p.nome,
        preco: p.precoMensal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        nota: p.beneficios[0] ?? "Benefícios na matrícula.",
        itens: p.beneficios.slice(0, 6),
        destaque: Boolean(p.destaque),
      }));
    }
    return defaultPlanCards();
  }, [plans]);

  const { primary, secondary, soft } = useMemo(
    () => tenantPalette(tenant),
    [tenant],
  );

  const backHref = user ? homePathForRole(user.role) : "/select-academia";
  const unidade = tenant?.nome ?? "sua academia";

  const telefoneWhatsApp =
    telefoneDb !== undefined ? telefoneDb : (tenant?.telefone ?? null);

  function waHrefForPlan(card: PlanCard): string | null {
    const msg = payMessage(unidade, card.nome, card.preco);
    return whatsappHrefFromTelefoneWithText(telefoneWhatsApp, msg);
  }

  return (
    <div className="min-h-screen bg-tenant-shell-bg px-4 py-8 text-tenant-shell-fg">
      <div className="mx-auto max-w-6xl">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-tenant-shell-fg"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Voltar ao painel
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Mensalidade — planos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Planos de referência da <span className="text-neutral-200">{unidade}</span>.
          Toque em <span className="text-neutral-200">Pagar mensalidade</span> para abrir o
          WhatsApp <span className="text-neutral-200">desta unidade</span> com a mensagem já
          preenchida.
        </p>
        {!telefoneWhatsApp && plansLoaded && telefoneDb !== undefined ? (
          <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Esta unidade ainda não tem o campo{" "}
            <span className="font-medium text-amber-50">WhatsApp da unidade</span> preenchido. O Ultra
            Admin configura em <span className="text-amber-50">Editar academia</span> (modal de
            academias); o admin local pode complementar em <span className="text-amber-50">Marca e site</span>.
          </p>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {planCards.map((p) => {
            const wa = waHrefForPlan(p);
            return (
              <div
                key={p.key}
                className={`flex flex-col rounded-3xl border p-6 ${
                  p.destaque
                    ? "border-transparent"
                    : "border-tenant-shell-border/35 bg-tenant-shell-card/85"
                }`}
                style={
                  p.destaque
                    ? {
                        borderColor: `${secondary}aa`,
                        backgroundImage: `linear-gradient(to bottom, ${primary}40, var(--tenant-shell-bg), ${soft}22)`,
                      }
                    : undefined
                }
              >
                <h2 className="text-lg font-semibold">{p.nome}</h2>
                <p className="mt-2 text-xs text-neutral-400">{p.nota}</p>
                <p className="mt-5 text-3xl font-semibold tabular-nums">{p.preco}</p>
                <p className="text-xs text-neutral-500">mensal · valores na matrícula</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-neutral-200">
                  {p.itens.map((i) => (
                    <li key={i} className="flex gap-2">
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="mt-0.5 shrink-0"
                        style={{ color: primary }}
                      />
                      {i}
                    </li>
                  ))}
                </ul>
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border-0 px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:brightness-110"
                    style={{ backgroundColor: primary }}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                    Pagar mensalidade
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-8 w-full cursor-not-allowed rounded-full border border-tenant-shell-border/40 px-4 py-2.5 text-sm text-neutral-500"
                  >
                    Pagar mensalidade (sem WhatsApp da unidade)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
