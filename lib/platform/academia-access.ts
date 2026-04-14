/** Unidade com acesso à plataforma (painéis + APIs tenant) suspenso pelo Ultra — não confundir com `status: inativa`. */
export function isAcademiaPlataformaDesligada(
  db: {
    academias: Array<{ id: string; plataformaDesligada?: boolean }>;
  },
  academiaId: string | null | undefined,
): boolean {
  if (!academiaId) return false;
  const a = db.academias.find((x) => x.id === academiaId);
  return a?.plataformaDesligada === true;
}
