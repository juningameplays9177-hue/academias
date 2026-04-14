import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { readPlatformPublicSnapshot } from "@/lib/db/file-store";
import { homePathForRole } from "@/lib/rbac/home-path";
import { isRoleId } from "@/lib/rbac/roles";
import type { SelectAcademiaPublicCard } from "@/lib/tenant/select-academia-types";
import { SelectAcademiaMultiClient } from "@/components/tenant/select-academia-multi-client";
import { SelectAcademiaPublicGrid } from "@/components/tenant/select-academia-public-grid";

/** Evita shell HTML estático longamente cacheado na borda (chunks404 após novo deploy). */
export const dynamic = "force-dynamic";

export default async function SelectAcademiaPage() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;

  const mustPickTenant = session?.needsTenantSelection === true;

  if (session && !mustPickTenant) {
    const role = isRoleId(session.role) ? session.role : "aluno";
    redirect(homePathForRole(role));
  }

  let initialAcademias: SelectAcademiaPublicCard[] = [];

  try {
    const platform = await readPlatformPublicSnapshot();
    if (platform) {
      initialAcademias = (platform.academias ?? [])
        .filter((a) => a.status === "ativo" && a.plataformaDesligada !== true)
        .map((a) => ({
          id: a.id,
          nome: a.nome,
          slug: a.slug,
          logoUrl: a.logoUrl ?? null,
          cidade: a.cidade ?? null,
          estado: a.estado ?? null,
          tagline: a.tagline ?? null,
        }));
    }
  } catch (err) {
    console.error("[select-academia] readPlatformPublicSnapshot", err);
  }

  const needsMultiPick = mustPickTenant;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Multi-unidade
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Escolha onde entrar
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            Entre na plataforma, conheça o site institucional ou escolha a unidade abaixo antes do
            login. Se o seu e-mail estiver cadastrado em mais de uma academia, após autenticar você
            escolhe o painel — os dados ficam sempre isolados por unidade.
          </p>
        </header>
        {needsMultiPick && session ? (
          <SelectAcademiaMultiClient
            initialUser={{
              id: session.sub,
              email: session.email,
              name: session.name,
              role: session.role,
              needsTenantSelection: true,
              memberships: session.memberships ?? [],
            }}
          />
        ) : (
          <SelectAcademiaPublicGrid academias={initialAcademias} />
        )}
      </div>
    </div>
  );
}
