export type DiaKcalStatus =
  | "sem-meta"
  | "sem-registro"
  | "faltou"
  | "na-meta"
  | "passou";

/** ±10% em torno da meta conta como “na meta”. */
export function statusConsumoDia(
  totalKcal: number,
  meta: number | null | undefined,
): DiaKcalStatus {
  if (meta == null || meta <= 0) return "sem-meta";
  if (!Number.isFinite(totalKcal) || totalKcal <= 0) return "sem-registro";
  const lo = meta * 0.9;
  const hi = meta * 1.1;
  if (totalKcal < lo) return "faltou";
  if (totalKcal > hi) return "passou";
  return "na-meta";
}

export function labelDiaKcalStatus(s: DiaKcalStatus): string {
  switch (s) {
    case "sem-meta":
      return "Sem meta definida";
    case "sem-registro":
      return "Sem registro";
    case "faltou":
      return "Faltou kcal";
    case "na-meta":
      return "Na meta";
    case "passou":
      return "Passou da meta";
    default:
      return "—";
  }
}

export function badgeClassDiaKcalStatus(s: DiaKcalStatus): string {
  switch (s) {
    case "sem-meta":
      return "border-white/20 bg-neutral-800 text-neutral-300";
    case "sem-registro":
      return "border-white/15 bg-neutral-900 text-neutral-500";
    case "faltou":
      return "border-sky-500/50 bg-sky-500/15 text-sky-200";
    case "na-meta":
      return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200";
    case "passou":
      return "border-amber-500/50 bg-amber-500/15 text-amber-200";
    default:
      return "border-border text-muted";
  }
}
