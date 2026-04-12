export const ROLE_IDS = [
  "ultra_admin",
  "admin",
  "professor",
  "aluno",
] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export const ROLE_LABELS: Record<RoleId, string> = {
  ultra_admin: "Ultra Admin",
  admin: "Administração",
  professor: "Professor",
  aluno: "Aluno",
};

export function isRoleId(value: string): value is RoleId {
  return (ROLE_IDS as readonly string[]).includes(value);
}
