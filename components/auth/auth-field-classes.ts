/**
 * Classes Tailwind compartilhadas entre formulários de autenticação (login/cadastro).
 * Mantidas num único lugar para consistência visual e manutenção.
 */

/** Campo de texto com ícone à esquerda (padding esquerdo extra no componente). */
export const AUTH_INPUT_SHELL =
  "w-full rounded-xl border border-border bg-background py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 dark:bg-card";

/** Ícone absoluto dentro do wrapper do input. */
export const AUTH_INPUT_ICON_CLASS =
  "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted";

/** Botão de revelar/ocultar senha (canto direito do campo). */
export const AUTH_PASSWORD_TOGGLE_CLASS =
  "absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-accent-soft hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent";
