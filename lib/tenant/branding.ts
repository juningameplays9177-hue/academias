import type { AcademiaRecord } from "@/lib/db/types";

/** Dados públicos da unidade para site e contexto cliente (SaaS multi-tenant). */
export type TenantAcademia = {
  id: string;
  nome: string;
  slug: string;
  endereco: string | null;
  telefone: string | null;
  instagram: string | null;
  email: string | null;
  logoUrl: string | null;
  corPrimaria: string | null;
  corPrimariaSecundaria: string | null;
  corPrimariaSuave: string | null;
  corFundo: string | null;
  corTexto: string | null;
  tagline: string | null;
  metaDescription: string | null;
  cidade: string | null;
  estado: string | null;
  googleMapsUrl: string | null;
};

export const DEFAULT_TENANT_PRIMARY = "#f97316";

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function sanitizeCorPrimaria(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  return HEX_RE.test(s) ? s : null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const s = hex.trim().replace(/^#/, "");
  const full =
    s.length === 3 ? s.split("").map((c) => c + c).join("") : s.length === 6 ? s : null;
  if (!full) return null;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mistura `hex` em direção a uma cor alvo (0 = mantém, 1 = alvo). */
function mixHex(hex: string, tr: number, tg: number, tb: number, t: number): string {
  const o = hexToRgb(hex);
  if (!o) return DEFAULT_TENANT_PRIMARY;
  return rgbToHex(
    o.r + (tr - o.r) * t,
    o.g + (tg - o.g) * t,
    o.b + (tb - o.b) * t,
  );
}

/** Segunda cor: um pouco mais clara que a principal (gradientes / faixas). */
export function defaultSecondaryFromPrimary(primary: string): string {
  return mixHex(primary, 255, 255, 255, 0.24);
}

/** Terceira cor: mais escura / contida (fundos e bordas suaves no tema escuro). */
export function defaultSoftFromPrimary(primary: string): string {
  return mixHex(primary, 0, 0, 0, 0.38);
}

export type TenantPalette = {
  /** Botões, ícones fortes, `--tenant-primary`. */
  primary: string;
  /** Gradientes, segunda tonalidade, `--tenant-secondary`. */
  secondary: string;
  /** Fundos / bordas leves, `--tenant-soft`. */
  soft: string;
};

export function tenantPalette(t: TenantAcademia | null): TenantPalette {
  const raw = t?.corPrimaria?.trim();
  const primary =
    raw && HEX_RE.test(raw) ? raw : DEFAULT_TENANT_PRIMARY;
  const sec =
    sanitizeCorPrimaria(t?.corPrimariaSecundaria ?? undefined) ??
    defaultSecondaryFromPrimary(primary);
  const soft =
    sanitizeCorPrimaria(t?.corPrimariaSuave ?? undefined) ??
    defaultSoftFromPrimary(primary);
  return { primary, secondary: sec, soft };
}

const STUB_TENANT: TenantAcademia = {
  id: "_",
  nome: "_",
  slug: "_",
  endereco: null,
  telefone: null,
  instagram: null,
  email: null,
  logoUrl: null,
  corPrimaria: null,
  corPrimariaSecundaria: null,
  corPrimariaSuave: null,
  corFundo: null,
  corTexto: null,
  tagline: null,
  metaDescription: null,
  cidade: null,
  estado: null,
  googleMapsUrl: null,
};

/** Paleta só com as cores salvas (ex.: cards do hub antes do login). */
export function paletteFromAcademyColors(
  corPrimaria: string | null | undefined,
  corPrimariaSecundaria?: string | null | undefined,
  corPrimariaSuave?: string | null | undefined,
): TenantPalette {
  return tenantPalette({
    ...STUB_TENANT,
    corPrimaria: corPrimaria ?? null,
    corPrimariaSecundaria: corPrimariaSecundaria ?? null,
    corPrimariaSuave: corPrimariaSuave ?? null,
  });
}

export function recordToTenantAcademia(a: AcademiaRecord): TenantAcademia {
  return {
    id: a.id,
    nome: a.nome,
    slug: a.slug,
    endereco: a.endereco ?? null,
    telefone: a.telefone ?? null,
    instagram: a.instagram ?? null,
    email: a.email ?? null,
    logoUrl: a.logoUrl ?? null,
    corPrimaria: sanitizeCorPrimaria(a.corPrimaria ?? undefined),
    corPrimariaSecundaria: sanitizeCorPrimaria(a.corPrimariaSecundaria ?? undefined),
    corPrimariaSuave: sanitizeCorPrimaria(a.corPrimariaSuave ?? undefined),
    corFundo: sanitizeCorPrimaria(a.corFundo ?? undefined),
    corTexto: sanitizeCorPrimaria(a.corTexto ?? undefined),
    tagline: a.tagline ?? null,
    metaDescription: a.metaDescription ?? null,
    cidade: a.cidade ?? null,
    estado: a.estado ?? null,
    googleMapsUrl: a.googleMapsUrl ?? null,
  };
}

/** @deprecated use `tenantPalette(t).primary` */
export function effectivePrimary(t: TenantAcademia | null): string {
  return tenantPalette(t).primary;
}

/** Instagram: aceita @arquivo ou URL completa. */
export function instagramHref(instagram: string | null | undefined): string | null {
  const s = (instagram ?? "").trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const handle = s.replace(/^@/, "").replace(/[^\w.]/g, "");
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}

/** Dígitos BR → link wa.me */
export function whatsappHrefFromTelefone(telefone: string | null | undefined): string | null {
  const digits = (telefone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const n = digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;
  const withCountry =
    n.length === 11 && !n.startsWith("55") ? `55${n}` : n.length === 10 ? `55${n}` : n;
  return `https://wa.me/${withCountry}`;
}

/** WhatsApp da unidade com mensagem inicial (ex.: pagamento de mensalidade). */
export function whatsappHrefFromTelefoneWithText(
  telefone: string | null | undefined,
  text: string,
): string | null {
  const base = whatsappHrefFromTelefone(telefone);
  if (!base) return null;
  const t = text.trim();
  if (!t) return base;
  return `${base}?text=${encodeURIComponent(t)}`;
}

export function defaultMetaDescription(t: TenantAcademia): string {
  if (t.metaDescription?.trim()) return t.metaDescription.trim();
  const loc = [t.cidade, t.estado].filter(Boolean).join(" · ");
  return `${t.nome}${loc ? ` — ${loc}` : ""}: musculação, funcional e treino com acompanhamento. Fale pelo site ou WhatsApp.`;
}
