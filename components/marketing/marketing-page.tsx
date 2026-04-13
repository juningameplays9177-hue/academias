"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBolt,
  faCircleCheck,
  faClock,
  faDumbbell,
  faFire,
  faHeartPulse,
  faLocationDot,
  faPhone,
  faStar,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faWhatsapp,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import {
  tenantPalette,
  instagramHref,
  whatsappHrefFromTelefone,
} from "@/lib/tenant/branding";
import { whatsappChatUrl } from "@/lib/whatsapp";

const NAV = [
  { href: "#sobre", label: "Sobre" },
  { href: "#planos", label: "Planos" },
  { href: "#modalidades", label: "Modalidades" },
  { href: "#galeria", label: "Ambiente" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#contato", label: "Contato" },
];

type PublicPlan = {
  id: string;
  nome: string;
  precoMensal: number;
  beneficios: string[];
  destaque?: boolean;
};

export function MarketingPage() {
  const { academia, loading: tenantLoading, refresh: refreshTenant } = useTenant();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const unidadeQuery = useMemo(
    () => searchParams.get("unidade")?.trim() ?? "",
    [searchParams],
  );
  /** Após tentativa sem cookie / alinhamento, mostra hub em vez de spinner infinito. */
  const [tenantBootstrapFailed, setTenantBootstrapFailed] = useState(false);
  const [slugMismatchAlign, setSlugMismatchAlign] = useState(false);

  useEffect(() => {
    setTenantBootstrapFailed(false);
  }, [user?.id, unidadeQuery]);

  useEffect(() => {
    if (academia) setTenantBootstrapFailed(false);
  }, [academia]);

  useEffect(() => {
    if (tenantLoading) return;

    if (academia) {
      if (
        user &&
        !user.needsTenantSelection &&
        unidadeQuery &&
        unidadeQuery.toLowerCase() !== academia.slug.toLowerCase()
      ) {
        setSlugMismatchAlign(true);
        const ac = new AbortController();
        void (async () => {
          try {
            const res = await fetch("/api/auth/align-tenant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              body: JSON.stringify({ slug: unidadeQuery }),
              signal: ac.signal,
            });
            if (!ac.signal.aborted && res.ok) await refreshTenant();
          } catch {
            /* abort */
          } finally {
            if (!ac.signal.aborted) setSlugMismatchAlign(false);
          }
        })();
        return () => ac.abort();
      }
      setSlugMismatchAlign(false);
      return;
    }

    if (user?.needsTenantSelection) return;

    if (user && !user.needsTenantSelection) {
      if (tenantBootstrapFailed) return;
      const ac = new AbortController();
      void (async () => {
        try {
          const res = await fetch("/api/auth/align-tenant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(unidadeQuery ? { slug: unidadeQuery } : {}),
            signal: ac.signal,
          });
          if (!ac.signal.aborted && res.ok) {
            await refreshTenant();
          } else if (!ac.signal.aborted) {
            setTenantBootstrapFailed(true);
          }
        } catch {
          if (!ac.signal.aborted) setTenantBootstrapFailed(true);
        }
      })();
      return () => ac.abort();
    }

    if (unidadeQuery) {
      if (tenantBootstrapFailed) return;
      const ac = new AbortController();
      void (async () => {
        try {
          const res = await fetch("/api/public/visitor-tenant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ slug: unidadeQuery }),
            signal: ac.signal,
          });
          if (!ac.signal.aborted && res.ok) {
            await refreshTenant();
          } else if (!ac.signal.aborted) {
            setTenantBootstrapFailed(true);
          }
        } catch {
          if (!ac.signal.aborted) setTenantBootstrapFailed(true);
        }
      })();
      return () => ac.abort();
    }
  }, [
    tenantLoading,
    academia,
    user,
    unidadeQuery,
    refreshTenant,
    tenantBootstrapFailed,
  ]);

  const awaitingTenantResolution = Boolean(
    !tenantLoading &&
      !academia &&
      !tenantBootstrapFailed &&
      ((user && !user.needsTenantSelection) || (!user && !!unidadeQuery)),
  );

  const showSiteSpinner =
    tenantLoading || slugMismatchAlign || awaitingTenantResolution;

  const [openMenu, setOpenMenu] = useState(false);
  const { pushToast } = useToast();
  const [sending, setSending] = useState(false);
  const [plans, setPlans] = useState<PublicPlan[]>([]);

  const { primary, secondary, soft } = useMemo(() => tenantPalette(academia), [academia]);

  const waMsg = useMemo(
    () => ({
      start: `Oi! Quero começar na ${academia?.nome ?? "academia"}.`,
      trial: `Oi! Quero agendar uma aula experimental na ${academia?.nome ?? "academia"}.`,
    }),
    [academia?.nome],
  );

  function waUrl(text: string) {
    const base = whatsappHrefFromTelefone(academia?.telefone ?? null);
    if (!base) return whatsappChatUrl(text);
    return `${base}?text=${encodeURIComponent(text)}`;
  }

  const mapsHref = academia?.googleMapsUrl?.trim() || null;
  const addressLine =
    academia?.endereco?.trim() ||
    [academia?.cidade, academia?.estado].filter(Boolean).join(" · ") ||
    "Endereço disponível na recepção.";
  const phoneDisplay = academia?.telefone?.trim() || "Telefone na recepção";
  const instaHref = instagramHref(academia?.instagram ?? null);

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
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [academia?.id]);

  const planCards = useMemo(() => {
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
  }, [plans]);

  async function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: fd.get("nome"),
          email: fd.get("email"),
          mensagem: fd.get("mensagem"),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Não enviou",
          description: (data as { error?: string }).error,
        });
        return;
      }
      pushToast({
        type: "success",
        title: "Mensagem registrada",
        description: data.message,
      });
      e.currentTarget.reset();
    } catch {
      pushToast({
        type: "error",
        title: "Falha de rede",
        description: "Chama no WhatsApp se for urgente.",
      });
    } finally {
      setSending(false);
    }
  }

  if (showSiteSpinner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tenant-shell-bg text-neutral-400">
        Carregando site da unidade…
      </div>
    );
  }

  if (!academia) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-tenant-shell-bg px-6 text-center text-tenant-shell-fg">
        <p className="max-w-md text-neutral-300">
          {user?.needsTenantSelection ? (
            <>
              Selecione primeiro em qual academia deseja entrar no hub — depois o site institucional
              fica disponível com a marca daquela unidade.
            </>
          ) : (
            <>
              Selecione uma unidade no hub ou abra o endereço da unidade, por exemplo{" "}
              <span className="font-mono text-neutral-200">/a/slug-da-academia</span>, para ver o site com
              planos, modalidades e contatos.
            </>
          )}
        </p>
        <Link
          href="/select-academia"
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-black"
          style={{ backgroundColor: primary }}
        >
          Escolher academia
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-tenant-shell-bg text-tenant-shell-fg [--t-primary:var(--tenant-primary)]"
      style={{ ["--t-primary" as string]: primary }}
    >
      <div
        className="border-b bg-gradient-to-r via-transparent to-transparent"
        style={{
          borderColor: `${soft}99`,
          backgroundImage: `linear-gradient(to right, ${primary}40, transparent, ${secondary}28)`,
        }}
      >
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm text-neutral-200">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black"
            style={{ backgroundColor: primary }}
          >
            últimas 4 vagas
          </span>
          Turma 19h (ter/qui) — fecha lista sexta. Não marca vaga por DM, fala
          com a recepção.
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-tenant-shell-border/35 bg-tenant-shell-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/select-academia" className="flex items-center gap-3 leading-tight">
            {academia.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={academia.logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-tenant-shell-border/35 object-cover"
              />
            ) : null}
            <span className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight">{academia.nome}</span>
              <span className="text-[11px] text-neutral-400">
                {academia.tagline?.trim() ||
                  [academia.cidade, academia.estado].filter(Boolean).join(" · ") ||
                  `@${academia.slug}`}
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm text-neutral-300 md:flex"
            aria-label="Seções"
          >
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="transition hover:text-tenant-shell-fg"
              >
                {n.label}
              </a>
            ))}
            <Link
              href="/login"
              className="rounded-full border border-tenant-shell-border/35 px-3 py-1 text-xs text-neutral-200 hover:border-tenant-shell-border/55 hover:text-tenant-shell-fg"
            >
              Login e cadastro
            </Link>
          </nav>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-tenant-shell-border/35 md:hidden"
            aria-label={openMenu ? "Fechar menu" : "Abrir menu"}
            aria-expanded={openMenu}
            onClick={() => setOpenMenu((v) => !v)}
          >
            <FontAwesomeIcon icon={openMenu ? faXmark : faBars} />
          </button>
        </div>
        {openMenu ? (
          <div className="border-t border-tenant-shell-border/25 px-4 pb-4 md:hidden">
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-2 py-2 text-neutral-200 hover:bg-tenant-shell-fg/8"
                  onClick={() => setOpenMenu(false)}
                >
                  {n.label}
                </a>
              ))}
              <Link
                href="/login"
                className="rounded-lg px-2 py-2 hover:bg-tenant-shell-fg/8"
                style={{ color: primary }}
                onClick={() => setOpenMenu(false)}
              >
                Login e cadastro
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80"
            alt="Treino na academia"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-tenant-shell-bg via-tenant-shell-bg/88 to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-24">
          <div className="max-w-xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-tenant-shell-border/35 bg-tenant-shell-fg/5 px-3 py-1 text-xs text-neutral-300">
              <FontAwesomeIcon icon={faBolt} style={{ color: primary }} />
              Avaliação física de verdade, não decoração de Instagram
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Menos discurso motivacional,{" "}
              <span style={{ color: primary }}>mais carga bem aplicada.</span>
            </h1>
            <p className="text-base text-neutral-300 sm:text-lg">
              A <strong className="text-tenant-shell-fg">{academia.nome}</strong> é aquela academia em que o
              ar condicionado funciona, o chão não escorrega e o professor sabe te explicar{" "}
              <em>por que</em> você tá fazendo aquela série chata.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={waUrl(waMsg.start)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:brightness-110"
                style={{ backgroundColor: primary }}
              >
                Começar no WhatsApp
              </a>
              <a
                href="#planos"
                className="inline-flex items-center justify-center rounded-full border border-tenant-shell-border/45 bg-tenant-shell-fg/5 px-6 py-2.5 text-sm font-medium text-tenant-shell-fg transition hover:bg-tenant-shell-fg/10"
              >
                Ver planos
              </a>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-neutral-400">
              <a
                href={mapsHref ?? "#contato"}
                target={mapsHref ? "_blank" : undefined}
                rel={mapsHref ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 rounded-lg transition hover:opacity-90"
                style={{ color: primary }}
              >
                <FontAwesomeIcon icon={faLocationDot} />
                {addressLine}
              </a>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} style={{ color: primary }} />
                Seg–sex 6h–23h · sáb 7h–16h · dom fechado (zona de limpeza)
              </div>
            </div>
          </div>
          <div className="relative mt-4 lg:mt-10">
            <div className="rotate-1 rounded-3xl border border-tenant-shell-border/35 bg-tenant-shell-card/90 p-5 shadow-2xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Micro-promo
              </p>
              <p className="mt-3 text-sm text-neutral-200">
                Primeira semana com acompanhamento no chão — a gente te deixa{" "}
                <span className="text-tenant-shell-fg">menos perdido</span> na máquina
                extensora.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li className="flex gap-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="mt-0.5"
                    style={{ color: primary }}
                  />
                  Estacionamento conveniado a duas quadras (ticket na recepção)
                </li>
                <li className="flex gap-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="mt-0.5"
                    style={{ color: primary }}
                  />
                  Café fraco de cortesia — ninguém finge que é Starbucks
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="sobre"
        className="border-t border-tenant-shell-border/25 bg-tenant-shell-card py-16"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"
        >
          <div className="space-y-4 lg:pr-10">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Sobre a unidade
            </h2>
            <p className="text-sm leading-relaxed text-neutral-300">
              A gente abriu em 2018 num galpão meio esquisito que virou referência
              no bairro por um motivo simples:{" "}
              <strong className="text-tenant-shell-fg">consistência</strong>. Horário
              estendido, ar limpo e equipamento quebrado some da área rápido —
              senão vira piada interna no grupo dos professores.
            </p>
            <p className="text-sm leading-relaxed text-neutral-300">
              Tem musculação pesada, treino funcional que não parece circo, e
              bike indoor barulhenta do jeito certo. Se você quer{" "}
              <span style={{ color: primary }}>“transformação em 21 dias”</span>,
              a gente te indica outro lugar. Aqui é papo de mês, trimestre, ano.
            </p>
          </div>
          <div className="space-y-4 rounded-3xl border border-tenant-shell-border/35 bg-tenant-shell-card/65 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              Equipe (parte dela)
            </h3>
            <ul className="space-y-3 text-sm text-neutral-200">
              <li>
                <span className="font-medium text-tenant-shell-fg">Marcos Antônio Vieira</span>{" "}
                — musculação, ombro irritado e gente que viaja a trabalho.
              </li>
              <li>
                <span className="font-medium text-tenant-shell-fg">Camila Rocha Duarte</span>{" "}
                — mobilidade, core e turma que reclama mas volta.
              </li>
              <li>
                <span className="font-medium text-tenant-shell-fg">Renata Moraes</span>{" "}
                — operação, contratos e aquela conversa chata que evita dor de
                cabeça depois.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="planos" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-2xl space-y-3">
            <h2 className="text-2xl font-semibold sm:text-3xl">Planos</h2>
            <p className="text-sm text-neutral-400">
              Valores de referência — na matrícula a gente confere se cabe
              desconto de VT, convênio ou indicação.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {planCards.map((p) => (
              <div
                key={p.key}
                className={`flex flex-col rounded-3xl border p-6 ${
                  p.destaque ? "border-transparent" : "border-tenant-shell-border/35 bg-tenant-shell-card/85"
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
                <h3 className="text-lg font-semibold">{p.nome}</h3>
                <p className="mt-2 text-xs text-neutral-400">{p.nota}</p>
                <p className="mt-5 text-3xl font-semibold">{p.preco}</p>
                <p className="text-xs text-neutral-500">mensal · multa rescisória na carência</p>
                <ul className="mt-6 space-y-2 text-sm text-neutral-200">
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
                <a
                  href={waUrl(waMsg.trial)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center justify-center rounded-full border border-tenant-shell-border/40 px-4 py-2 text-sm transition hover:border-tenant-shell-border/55 hover:text-tenant-shell-fg"
                >
                  Agendar aula experimental
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="modalidades"
        className="border-t border-tenant-shell-border/25 bg-gradient-to-b from-tenant-shell-card to-tenant-shell-bg py-16"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">Modalidades</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Musculação",
                d: "Foco em técnica, alívio de dor e progressão real de carga.",
                i: faDumbbell,
              },
              {
                t: "Funcional",
                d: "Circuitos inteligentes — sem salto aleatório pra inflar story.",
                i: faHeartPulse,
              },
              {
                t: "Bike indoor",
                d: "Sprint, subida, playlist alta — chega suado ou não chega.",
                i: faFire,
              },
              {
                t: "Mobilidade guiada",
                d: "Turmas menores, ótimo pra quem vive travado de home office.",
                i: faBolt,
              },
            ].map((m) => (
              <div
                key={m.t}
                className="rounded-2xl border border-tenant-shell-border/35 bg-tenant-shell-card/65 p-4"
              >
                <FontAwesomeIcon icon={m.i} className="text-xl" style={{ color: primary }} />
                <h3 className="mt-3 text-base font-semibold">{m.t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="galeria" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ambiente</h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-400">
            Fotos reais de academia são meio iguais, então variamos o recorte
            pra você sentir textura, luz e espaço — não só equipamento novo.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80",
            ].map((src, idx) => (
              <div
                key={src}
                className={`relative h-48 overflow-hidden rounded-2xl border border-tenant-shell-border/35 sm:h-56 ${
                  idx === 1 ? "sm:translate-y-4" : ""
                }`}
              >
                <Image
                  src={src}
                  alt={`Ambiente ${idx + 1}`}
                  fill
                  className="object-cover transition duration-500 hover:scale-105"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="depoimentos"
        className="border-t border-tenant-shell-border/25 bg-tenant-shell-card py-16"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">Depoimentos</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                nome: "Fernanda Okada",
                texto:
                  "Já passei por academia bonitinha que não tinha onde respirar. Aqui é cheio, mas organizado. Nota 4,8 no cérebro, 5 no ar.",
                nota: 5,
              },
              {
                nome: "Diego Pacheco",
                texto:
                  "O Marcos ajustou minha pegada no supino e sumiu um incômodo no punho. Não é mágica, é detalhe chato feito certo.",
                nota: 5,
              },
              {
                nome: "Helena Prado",
                texto:
                  "Turma das 19h é barulhenta, mas a Camila segura a onda. Prefiro assim do que treinar em silêncio tenso.",
                nota: 4,
              },
            ].map((d) => (
              <figure
                key={d.nome}
                className="rounded-3xl border border-tenant-shell-border/35 bg-tenant-shell-card/72 p-5"
              >
                <div className="flex gap-1" style={{ color: primary }} aria-label={`${d.nota} de 5 estrelas`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={i < d.nota ? "" : "opacity-25"}
                    />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-neutral-200">
                  “{d.texto}”
                </blockquote>
                <figcaption className="mt-4 text-xs font-medium text-neutral-400">
                  {d.nome}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">Contato</h2>
            <p className="text-sm text-neutral-400">
              Manda mensagem com calma — a recepção lê tudo, mas às 18h vira
              caos bonito.
            </p>
            <div className="space-y-3 text-sm text-neutral-200">
              <a
                href={waUrl(waMsg.start)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg transition hover:opacity-90"
                style={{ color: primary }}
              >
                <FontAwesomeIcon icon={faPhone} />
                {phoneDisplay} · abrir WhatsApp
              </a>
              <a
                href={mapsHref ?? "#contato"}
                target={mapsHref ? "_blank" : undefined}
                rel={mapsHref ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 rounded-lg transition hover:opacity-90"
                style={{ color: primary }}
              >
                <FontAwesomeIcon icon={faLocationDot} />
                {addressLine}
              </a>
              {academia.email ? (
                <a
                  href={`mailto:${academia.email}`}
                  className="flex items-center gap-2 rounded-lg text-neutral-300 transition hover:text-tenant-shell-fg"
                >
                  {academia.email}
                </a>
              ) : null}
            </div>
          </div>
          <form
            onSubmit={(e) => void handleContact(e)}
            className="space-y-4 rounded-3xl border border-tenant-shell-border/35 bg-tenant-shell-card/85 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-neutral-300">
                Nome
                <input
                  name="nome"
                  required
                  className="mt-1 w-full rounded-lg border border-tenant-shell-border/35 bg-tenant-shell-bg px-3 py-2 text-sm text-tenant-shell-fg outline-none focus:border-[var(--tenant-primary)]"
                />
              </label>
              <label className="text-sm text-neutral-300">
                E-mail
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-tenant-shell-border/35 bg-tenant-shell-bg px-3 py-2 text-sm text-tenant-shell-fg outline-none focus:border-[var(--tenant-primary)]"
                />
              </label>
            </div>
            <label className="block text-sm text-neutral-300">
              Mensagem
              <textarea
                name="mensagem"
                required
                className="mt-1 min-h-[120px] w-full rounded-lg border border-tenant-shell-border/35 bg-tenant-shell-bg px-3 py-2 text-sm text-tenant-shell-fg outline-none focus:border-[var(--tenant-primary)]"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                type="submit"
                disabled={sending}
                className="w-full border-0 bg-[var(--tenant-primary)] text-black shadow-sm hover:brightness-110 sm:w-auto"
              >
                {sending ? "Enviando…" : "Mandar pra recepção"}
              </Button>
              <a
                href={waUrl(waMsg.start)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:brightness-110 sm:w-auto"
                style={{
                  borderColor: `${primary}88`,
                  backgroundColor: `${primary}22`,
                  color: primary,
                }}
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                Abrir WhatsApp
              </a>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-tenant-shell-border/35 bg-tenant-shell-card py-10 text-sm text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-tenant-shell-fg">{academia.nome}</p>
            <p className="mt-1 text-xs">
              © {new Date().getFullYear()} · CNPJ fictício 12.345.678/0001-90
            </p>
          </div>
          <div className="flex gap-4 text-lg text-neutral-300">
            {instaHref ? (
              <a
                href={instaHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-tenant-shell-fg"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            ) : null}
            <a
              href={waUrl(waMsg.start)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="transition hover:opacity-90"
              style={{ color: primary }}
            >
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="transition hover:opacity-90"
              style={{ color: primary }}
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
