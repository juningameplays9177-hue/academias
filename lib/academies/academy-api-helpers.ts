import type { AcademiaRecord, AppDatabase } from "@/lib/db/types";
import { slugifyBr } from "@/lib/utils/slugify";

export type AcademiaApiShape = {
  id: string;
  nome: string;
  slug: string;
  status: AcademiaRecord["status"];
  logoUrl: string | null;
  plataformaDesligada: boolean;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  googleMapsUrl: string | null;
};

export function serializeAcademia(a: AcademiaRecord): AcademiaApiShape {
  return {
    id: a.id,
    nome: a.nome,
    slug: a.slug,
    status: a.status,
    logoUrl: a.logoUrl ?? null,
    plataformaDesligada: Boolean(a.plataformaDesligada),
    email: a.email ?? null,
    cidade: a.cidade ?? null,
    estado: a.estado ?? null,
    googleMapsUrl: a.googleMapsUrl ?? null,
  };
}

export function uniqueSlugForDraft(
  draft: AppDatabase,
  base: string,
  ignoreId?: string,
): string {
  let slug = slugifyBr(base);
  let n = 0;
  while (
    draft.academias.some((x) => x.slug === slug && (!ignoreId || x.id !== ignoreId))
  ) {
    n += 1;
    slug = `${slugifyBr(base)}-${n}`;
  }
  return slug;
}

export function countAcademiaRefs(draft: AppDatabase, academiaId: string) {
  return {
    users: draft.users.filter((u) => u.academiaId === academiaId).length,
    students: draft.students.filter((s) => s.academiaId === academiaId).length,
    professors: draft.professors.filter((p) => p.academiaId === academiaId).length,
    notices: draft.notices.filter((n) => n.academiaId === academiaId).length,
    classes: draft.classes.filter((c) => c.academiaId === academiaId).length,
    workouts: draft.workouts.filter((w) => w.academiaId === academiaId).length,
    attendance: draft.attendance.filter((x) => x.academiaId === academiaId).length,
  };
}

export function totalRefs(refs: ReturnType<typeof countAcademiaRefs>): number {
  return Object.values(refs).reduce((a, b) => a + b, 0);
}
