import type { StudentRecord } from "@/lib/db/types";

/** Remove senha antes de enviar ao cliente (admin / listagens). */
export function studentWithoutPassword(
  s: StudentRecord,
): Omit<StudentRecord, "password"> {
  const { password, ...rest } = s;
  void password;
  return rest;
}

/** Lista do professor: sem senha nem histórico de consumo do aluno. */
export function studentForProfessorList(
  s: StudentRecord,
): Omit<StudentRecord, "password" | "consumoKcalPorDia"> {
  const { password, consumoKcalPorDia, ...rest } = s;
  void password;
  void consumoKcalPorDia;
  return rest;
}
