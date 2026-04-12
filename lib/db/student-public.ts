import type { StudentRecord } from "@/lib/db/types";

/** Remove senha antes de enviar ao cliente (admin / listagens). */
export function studentWithoutPassword(
  s: StudentRecord,
): Omit<StudentRecord, "password"> {
  const { password: _removed, ...rest } = s;
  return rest;
}

/** Lista do professor: sem senha nem histórico de consumo do aluno. */
export function studentForProfessorList(
  s: StudentRecord,
): Omit<StudentRecord, "password" | "consumoKcalPorDia"> {
  const { password: _p, consumoKcalPorDia: _c, ...rest } = s;
  return rest;
}
