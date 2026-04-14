/** Resolve o valor bruto do cookie de unidade (id ou slug) para o id canônico da academia. */
export function resolveTenantCookieRaw(
  academias: { id: string; slug: string }[],
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  const byId = academias.find((a) => a.id === t);
  if (byId) return byId.id;
  const lower = t.toLowerCase();
  const bySlug = academias.find((a) => a.slug.toLowerCase() === lower);
  return bySlug?.id ?? null;
}
