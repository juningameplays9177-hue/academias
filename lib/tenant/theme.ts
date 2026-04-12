import type { TenantAcademia, TenantPalette } from "@/lib/tenant/branding";
import {
  DEFAULT_TENANT_PRIMARY,
  sanitizeCorPrimaria,
  tenantPalette,
} from "@/lib/tenant/branding";

/** Fundo padrão dos shells (site + painéis) quando a academia não define `corFundo`. */
export const DEFAULT_TENANT_SHELL_BG = "#000000";
/** Texto padrão sobre o fundo do tema. */
export const DEFAULT_TENANT_SHELL_FG = "#fafafa";

export type TenantTheme = TenantPalette & {
  shellBackground: string;
  shellForeground: string;
  /** Borda / divisória suave derivada do fundo (mix com primária). */
  shellBorder: string;
  /** Superfície de cartão levemente elevada sobre o fundo. */
  shellCard: string;
};

function toFullHex(hex: string, fallback: string): string {
  const s = hex.trim().replace(/^#/, "");
  if (s.length === 6 && /^[0-9a-fA-F]{6}$/i.test(s)) return `#${s}`;
  if (s.length === 3 && /^[0-9a-fA-F]{3}$/i.test(s)) {
    return `#${s.split("").map((c) => c + c).join("")}`;
  }
  return fallback;
}

function mixToward(fg: string, bg: string, t: number): string {
  const a = toFullHex(fg, DEFAULT_TENANT_SHELL_FG).replace(/^#/, "");
  const b = toFullHex(bg, DEFAULT_TENANT_SHELL_BG).replace(/^#/, "");
  if (a.length !== 6 || b.length !== 6) return fg;
  const pa = [0, 2, 4].map((i) => Number.parseInt(a.slice(i, i + 2), 16));
  const pb = [0, 2, 4].map((i) => Number.parseInt(b.slice(i, i + 2), 16));
  if (pa.some(Number.isNaN) || pb.some(Number.isNaN)) return fg;
  const out = pa.map((x, i) =>
    Math.round(x + (pb[i]! - x) * t)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${out.join("")}`;
}

/**
 * Tema completo da unidade (cores de marca + shell white-label).
 * Usado por `useTheme`, `TenantHeadEffects` e shells (`DashboardShell`, site).
 */
export function tenantTheme(t: TenantAcademia | null): TenantTheme {
  const pal = tenantPalette(t);
  const shellBg =
    sanitizeCorPrimaria(t?.corFundo ?? undefined) ?? DEFAULT_TENANT_SHELL_BG;
  const shellFg =
    sanitizeCorPrimaria(t?.corTexto ?? undefined) ?? DEFAULT_TENANT_SHELL_FG;
  const shellBorder = mixToward(shellFg, shellBg, 0.82);
  const shellCard = mixToward(shellBg, toFullHex(pal.primary, DEFAULT_TENANT_PRIMARY), 0.06);
  return {
    ...pal,
    shellBackground: shellBg,
    shellForeground: shellFg,
    shellBorder,
    shellCard,
  };
}
