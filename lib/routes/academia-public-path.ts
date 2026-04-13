/**
 * URL pública dedicada de cada unidade (`/a/[slug]`).
 * O conteúdo e o tema vêm do registro da academia; os dados operacionais ficam em `data/tenants/{id}.json`.
 */
export function academiaPublicSitePath(slug: string): string {
  const s = slug.trim();
  if (!s) return "/select-academia";
  return `/a/${encodeURIComponent(s)}`;
}
