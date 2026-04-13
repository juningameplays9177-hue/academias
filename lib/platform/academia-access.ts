import type { AppDatabase } from "@/lib/db/types";

/** Unidade com acesso à plataforma (painéis + APIs tenant) suspenso pelo Ultra — não confundir com `status: inativa`. */
export function isAcademiaPlataformaDesligada(
  db: Pick<AppDatabase, "academias">,
  academiaId: string | null | undefined,
): boolean {
  if (!academiaId) return false;
  const a = db.academias.find((x) => x.id === academiaId);
  return Boolean(a?.plataformaDesligada);
}
