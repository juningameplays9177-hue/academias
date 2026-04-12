import type { AppDatabase, PlanRecord } from "@/lib/db/types";

/** Planos iniciais padrão para uma nova unidade (multi-tenant). */
export function appendDefaultPlansForAcademia(
  draft: AppDatabase,
  academiaId: string,
): void {
  const u = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const plans: PlanRecord[] = [
    {
      id: `plan-${u}-bas`,
      academiaId,
      nome: "Básico · off-peak",
      precoMensal: 119.9,
      beneficios: [
        "Acesso em horário reduzido em dias úteis",
        "App com check-in e fila de aparelhos",
        "1 avaliação física / trimestre",
      ],
    },
    {
      id: `plan-${u}-full`,
      academiaId,
      nome: "Full time",
      precoMensal: 189.9,
      beneficios: [
        "Horário estendido",
        "1 aula experimental / mês (funcional ou bike)",
        "Armário médio incluso",
      ],
      destaque: true,
    },
    {
      id: `plan-${u}-perf`,
      academiaId,
      nome: "Performance",
      precoMensal: 269.9,
      beneficios: [
        "Tudo do Full time",
        "2 sessões com coach / mês",
        "Prioridade em turmas lotadas",
        "Nutrição básica no app",
      ],
    },
  ];
  draft.plans.push(...plans);
}
