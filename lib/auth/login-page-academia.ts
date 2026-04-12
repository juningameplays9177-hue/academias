import { cookies } from "next/headers";
import { readDatabase } from "@/lib/db/file-store";
import { TENANT_COOKIE_NAME } from "@/lib/auth/tenant-cookie";

/**
 * Nome da unidade para título da página de login (sempre lido do banco —
 * reflete alterações feitas no Ultra Admin).
 */
export async function resolveLoginAcademiaNome(
  searchParams: { unidade?: string },
): Promise<string | null> {
  const db = await readDatabase();
  const slug = searchParams.unidade?.trim().toLowerCase();
  if (slug) {
    const bySlug = db.academias.find((a) => a.slug.toLowerCase() === slug);
    if (bySlug?.nome) return bySlug.nome;
  }
  const jar = await cookies();
  const tenantId = jar.get(TENANT_COOKIE_NAME)?.value?.trim();
  if (tenantId) {
    const byId = db.academias.find((a) => a.id === tenantId);
    if (byId?.nome) return byId.nome;
  }
  return null;
}

export function loginPageTitleParts(nome: string | null): { title: string; h1: string } {
  const suffix = "Login e cadastro";
  if (nome?.trim()) {
    return {
      title: `${nome.trim()} · ${suffix}`,
      h1: `${nome.trim()} · ${suffix}`,
    };
  }
  return {
    title: `${suffix} · PowerFit`,
    h1: suffix,
  };
}
