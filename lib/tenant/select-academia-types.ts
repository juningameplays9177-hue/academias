/** Dados mínimos para o hub de seleção (SSR + cliente). */
export type SelectAcademiaPublicCard = {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  cidade: string | null;
  estado: string | null;
  tagline: string | null;
};
