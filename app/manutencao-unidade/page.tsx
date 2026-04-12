import Link from "next/link";

export default function ManutencaoUnidadePage() {
  return (
    <div className="min-h-screen bg-black px-4 py-20 text-center text-neutral-200">
      <div className="mx-auto max-w-lg rounded-2xl border border-orange-500/30 bg-neutral-950/80 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
          Unidade suspensa
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Esta academia está temporariamente fora do ar
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          O Ultra Admin desligou o acesso à plataforma só para esta unidade. Você pode sair desta
          unidade e escolher outra, se tiver acesso.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/select-academia"
            className="inline-flex justify-center rounded-full border border-orange-500/50 bg-orange-500/10 px-6 py-2.5 text-sm font-medium text-orange-100 transition hover:bg-orange-500/20"
          >
            Escolher outra academia
          </Link>
          <Link
            href="/login"
            className="inline-flex justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-white/5"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
