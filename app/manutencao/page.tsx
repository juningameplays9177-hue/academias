import Link from "next/link";
import { redirect } from "next/navigation";
import { readDatabase } from "@/lib/db/file-store";
import { isSitePublicOff } from "@/lib/platform/site-public-off";

export const dynamic = "force-dynamic";

export default async function ManutencaoPage() {
  const db = await readDatabase();
  if (!isSitePublicOff(db)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black px-4 py-20 text-center text-neutral-200">
      <div className="mx-auto max-w-lg rounded-2xl border border-orange-500/30 bg-neutral-950/80 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
          Plataforma em pausa
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Site temporariamente indisponível
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          O acesso público e os painéis foram suspensos pelo Ultra Admin. Voltamos em
          breve — apenas a equipe master pode operar o sistema neste momento.
        </p>
        <p className="mt-6 text-sm text-neutral-500">
          Se você é o Ultra Admin, entre pela página de login.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full border border-orange-500/50 bg-orange-500/10 px-6 py-2.5 text-sm font-medium text-orange-100 transition hover:bg-orange-500/20"
        >
          Ir para o login
        </Link>
      </div>
    </div>
  );
}
