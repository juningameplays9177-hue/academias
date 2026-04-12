import type { RoleId } from "@/lib/rbac/roles";

/** Chaves granulares do painel do aluno — extensível sem mudar a estrutura principal */
export const STUDENT_PANEL_KEYS = [
  "treino",
  "dieta",
  "agenda",
  "progresso",
  "avaliacao",
] as const;

export type StudentPanelPermissionKey = (typeof STUDENT_PANEL_KEYS)[number];

export type PermissionDefinition = {
  id: string;
  label: string;
  description: string;
  /** Em qual painel a permissão aparece */
  scope: "student_panel" | "admin" | "professor";
};

export const PERMISSION_REGISTRY: Record<string, PermissionDefinition> = {
  "student.treino": {
    id: "student.treino",
    label: "Treinos",
    description: "Ver fichas e treinos liberados",
    scope: "student_panel",
  },
  "student.dieta": {
    id: "student.dieta",
    label: "Nutrição",
    description: "Plano alimentar e orientações",
    scope: "student_panel",
  },
  "student.agenda": {
    id: "student.agenda",
    label: "Agenda",
    description: "Aulas marcadas e horários",
    scope: "student_panel",
  },
  "student.progresso": {
    id: "student.progresso",
    label: "Progresso",
    description: "Cargas, medidas e evolução",
    scope: "student_panel",
  },
  "student.avaliacao": {
    id: "student.avaliacao",
    label: "Avaliação física",
    description: "Resultados de bioimpedância e testes",
    scope: "student_panel",
  },
  "admin.students.write": {
    id: "admin.students.write",
    label: "Alunos (escrita)",
    description: "Criar, editar e remover alunos",
    scope: "admin",
  },
  "admin.plans.write": {
    id: "admin.plans.write",
    label: "Planos (escrita)",
    description: "Gerir planos e preços",
    scope: "admin",
  },
  "admin.professors.write": {
    id: "admin.professors.write",
    label: "Professores (escrita)",
    description: "Gerir corpo técnico",
    scope: "admin",
  },
  "admin.notices.write": {
    id: "admin.notices.write",
    label: "Avisos",
    description: "Enviar comunicados",
    scope: "admin",
  },
  "professor.workouts.write": {
    id: "professor.workouts.write",
    label: "Treinos",
    description: "Criar e atribuir treinos",
    scope: "professor",
  },
  "professor.attendance.write": {
    id: "professor.attendance.write",
    label: "Presença",
    description: "Registrar presença em aulas",
    scope: "professor",
  },
};

/** Mapa role → permissões padrão (RBAC escalável) */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleId, string[]> = {
  ultra_admin: Object.keys(PERMISSION_REGISTRY),
  admin: Object.keys(PERMISSION_REGISTRY).filter((k) =>
    k.startsWith("admin."),
  ),
  professor: [
    "professor.workouts.write",
    "professor.attendance.write",
  ],
  aluno: [],
};

export function roleHasPermission(
  role: RoleId,
  permissionId: string,
): boolean {
  const list = DEFAULT_ROLE_PERMISSIONS[role];
  return list?.includes(permissionId) ?? false;
}
