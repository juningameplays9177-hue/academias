"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
import {
  GOOGLE_MAPS_LOCATION_URL,
  GYM_ADDRESS_LINE,
} from "@/lib/google-maps";
import { INSTAGRAM_PROFILE_URL } from "@/lib/instagram";
import { WHATSAPP_DISPLAY, whatsappChatUrl } from "@/lib/whatsapp";

const WA_MSG = {
  start: "Oi! Quero começar na Beira Rio Fit.",
  trial: "Oi! Quero agendar uma aula experimental.",
} as const;

const NAV = [
  { href: "#sobre", label: "Sobre" },
  { href: "#planos", label: "Planos" },
  { href: "#modalidades", label: "Modalidades" },
  { href: "#galeria", label: "Ambiente" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#contato", label: "Contato" },
];

export function MarketingPage() {
  const [openMenu, setOpenMenu] = useState(false);
  const { pushToast } = useToast();
  const [sending, setSending] = useState(false);

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-orange-500/35 bg-gradient-to-r from-orange-600/30 via-transparent to-orange-500/10">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm text-neutral-200">
          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
            últimas 4 vagas
          </span>
          Turma 19h (ter/qui) — fecha lista sexta. Não marca vaga por DM, fala
          com a recepção.
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight">
              Beira Rio Fit
            </span>
            <span className="text-[11px] text-neutral-400">
              Recreio dos Bandeirantes · treino sério sem frescura
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
                className="transition hover:text-white"
              >
                {n.label}
              </a>
            ))}
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 hover:border-orange-500/70 hover:text-white"
            >
              Login e cadastro
            </Link>
          </nav>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 md:hidden"
            aria-label={openMenu ? "Fechar menu" : "Abrir menu"}
            aria-expanded={openMenu}
            onClick={() => setOpenMenu((v) => !v)}
          >
            <FontAwesomeIcon icon={openMenu ? faXmark : faBars} />
          </button>
        </div>
        {openMenu ? (
          <div className="border-t border-white/5 px-4 pb-4 md:hidden">
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-2 py-2 text-neutral-200 hover:bg-white/5"
                  onClick={() => setOpenMenu(false)}
                >
                  {n.label}
                </a>
              ))}
              <Link
                href="/login"
                className="rounded-lg px-2 py-2 text-orange-400 hover:bg-white/5"
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
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/25" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-24">
          <div className="max-w-xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
              <FontAwesomeIcon icon={faBolt} className="text-orange-400" />
              Avaliação física de verdade, não decoração de Instagram
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Menos discurso motivacional,{" "}
              <span className="text-orange-400">mais carga bem aplicada.</span>
            </h1>
            <p className="text-base text-neutral-300 sm:text-lg">
              A Beira Rio Fit é aquela academia em que o ar condicionado funciona,
              o chão não escorrega e o professor sabe te explicar{" "}
              <em>por que</em> você tá fazendo aquela série chata.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappChatUrl(WA_MSG.start)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-400"
              >
                Começar no WhatsApp
              </a>
              <a
                href="#planos"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Ver planos
              </a>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-neutral-400">
              <a
                href={GOOGLE_MAPS_LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg transition hover:text-orange-300"
              >
                <FontAwesomeIcon icon={faLocationDot} className="text-orange-400" />
                {GYM_ADDRESS_LINE}
              </a>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-orange-300" />
                Seg–sex 6h–23h · sáb 7h–16h · dom fechado (zona de limpeza)
              </div>
            </div>
          </div>
          <div className="relative mt-4 lg:mt-10">
            <div className="rotate-1 rounded-3xl border border-white/10 bg-neutral-950/90 p-5 shadow-2xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Micro-promo
              </p>
              <p className="mt-3 text-sm text-neutral-200">
                Primeira semana com acompanhamento no chão — a gente te deixa{" "}
                <span className="text-white">menos perdido</span> na máquina
                extensora.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li className="flex gap-2">
                  <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 text-orange-400" />
                  Estacionamento conveniado a duas quadras (ticket na recepção)
                </li>
                <li className="flex gap-2">
                  <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 text-orange-400" />
                  Café fraco de cortesia — ninguém finge que é Starbucks
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="sobre"
        className="border-t border-white/5 bg-neutral-950 py-16"
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
              <strong className="text-white">consistência</strong>. Horário
              estendido, ar limpo e equipamento quebrado some da área rápido —
              senão vira piada interna no grupo dos professores.
            </p>
            <p className="text-sm leading-relaxed text-neutral-300">
              Tem musculação pesada, treino funcional que não parece circo, e
              bike indoor barulhenta do jeito certo. Se você quer{" "}
              <span className="text-orange-300">“transformação em 21 dias”</span>,
              a gente te indica outro lugar. Aqui é papo de mês, trimestre, ano.
            </p>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              Equipe (parte dela)
            </h3>
            <ul className="space-y-3 text-sm text-neutral-200">
              <li>
                <span className="font-medium text-white">Marcos Antônio Vieira</span>{" "}
                — musculação, ombro irritado e gente que viaja a trabalho.
              </li>
              <li>
                <span className="font-medium text-white">Camila Rocha Duarte</span>{" "}
                — mobilidade, core e turma que reclama mas volta.
              </li>
              <li>
                <span className="font-medium text-white">Renata Moraes</span>{" "}
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
            {[
              {
                nome: "Off-peak",
                preco: "R$ 129,90",
                nota: "Pra quem treina cedo ou no meio do dia.",
                itens: [
                  "Seg–sex 6h–14h",
                  "Avaliação física trimestral",
                  "App com check-in",
                ],
              },
              {
                nome: "Full time",
                preco: "R$ 189,90",
                nota: "O mais escolhido — mistura bom senso com liberdade.",
                destaque: true,
                itens: [
                  "Horário liberado",
                  "1 aula extra / mês",
                  "Armário médio incluso",
                ],
              },
              {
                nome: "Performance",
                preco: "R$ 279,90",
                nota: "Quem quer coach no bolso (dentro do razoável).",
                itens: [
                  "2 sessões com coach / mês",
                  "Prioridade em turmas lotadas",
                  "Nutrição básica no app",
                ],
              },
            ].map((p) => (
              <div
                key={p.nome}
                className={`flex flex-col rounded-3xl border p-6 ${
                  p.destaque
                    ? "border-orange-500/60 bg-gradient-to-b from-orange-500/20 to-black"
                    : "border-white/10 bg-neutral-950/80"
                }`}
              >
                <h3 className="text-lg font-semibold">{p.nome}</h3>
                <p className="mt-2 text-xs text-neutral-400">{p.nota}</p>
                <p className="mt-5 text-3xl font-semibold">{p.preco}</p>
                <p className="text-xs text-neutral-500">mensal · multa rescisória na carência</p>
                <ul className="mt-6 space-y-2 text-sm text-neutral-200">
                  {p.itens.map((i) => (
                    <li key={i} className="flex gap-2">
                      <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 text-orange-400" />
                      {i}
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappChatUrl(WA_MSG.trial)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm hover:border-orange-400/80 hover:text-white"
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
        className="border-t border-white/5 bg-gradient-to-b from-neutral-950 to-black py-16"
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
                className="rounded-2xl border border-white/10 bg-black/60 p-4"
              >
                <FontAwesomeIcon icon={m.i} className="text-xl text-orange-400" />
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
                className={`relative h-48 overflow-hidden rounded-2xl border border-white/10 sm:h-56 ${
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
        className="border-t border-white/5 bg-neutral-950 py-16"
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
                className="rounded-3xl border border-white/10 bg-black/70 p-5"
              >
                <div className="flex gap-1 text-orange-400" aria-label={`${d.nota} de 5 estrelas`}>
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
                href={whatsappChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg transition hover:text-orange-300"
              >
                <FontAwesomeIcon icon={faPhone} className="text-orange-400" />
                {WHATSAPP_DISPLAY} · abrir WhatsApp
              </a>
              <a
                href={GOOGLE_MAPS_LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg transition hover:text-orange-300"
              >
                <FontAwesomeIcon icon={faLocationDot} className="text-orange-300" />
                {GYM_ADDRESS_LINE}
              </a>
            </div>
          </div>
          <form
            onSubmit={(e) => void handleContact(e)}
            className="space-y-4 rounded-3xl border border-white/10 bg-neutral-950/80 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-neutral-300">
                Nome
                <input
                  name="nome"
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-orange-500/80"
                />
              </label>
              <label className="text-sm text-neutral-300">
                E-mail
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-orange-500/80"
                />
              </label>
            </div>
            <label className="block text-sm text-neutral-300">
              Mensagem
              <textarea
                name="mensagem"
                required
                className="mt-1 min-h-[120px] w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-orange-500/80"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                {sending ? "Enviando…" : "Mandar pra recepção"}
              </Button>
              <a
                href={whatsappChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300 transition hover:border-orange-400 hover:bg-orange-500/20 sm:w-auto"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                Abrir WhatsApp
              </a>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black py-10 text-sm text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-white">Beira Rio Fit</p>
            <p className="mt-1 text-xs">
              © {new Date().getFullYear()} · CNPJ fictício 12.345.678/0001-90
            </p>
          </div>
          <div className="flex gap-4 text-lg text-neutral-300">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href={whatsappChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:text-orange-400"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="hover:text-orange-400"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
