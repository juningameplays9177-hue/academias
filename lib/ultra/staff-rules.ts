import type { AuthUserRecord } from "@/lib/db/types";
import type { RoleId } from "@/lib/rbac/roles";

export function countUltraAdmins(users: AuthUserRecord[]): number {
  return users.filter((u) => u.role === "ultra_admin").length;
}

export function assertNotLastUltraRemoval(
  users: AuthUserRecord[],
  target: AuthUserRecord,
): void {
  if (target.role !== "ultra_admin") return;
  if (countUltraAdmins(users) <= 1) {
    throw new Error("Não é possível remover o único Ultra Admin do sistema.");
  }
}

export function assertRoleChangeKeepsUltra(
  users: AuthUserRecord[],
  targetId: string,
  nextRole: RoleId,
): void {
  const target = users.find((u) => u.id === targetId);
  if (!target) return;
  if (target.role !== "ultra_admin") return;
  if (nextRole === "ultra_admin") return;
  const remaining = countUltraAdmins(users) - 1;
  if (remaining < 1) {
    throw new Error(
      "Tem que existir pelo menos um Ultra Admin. Promova outro usuário antes de rebaixar este.",
    );
  }
}

export function assertOnlyUltraModifiesUltra(
  actorRole: RoleId,
  target: AuthUserRecord,
): void {
  if (target.role === "ultra_admin" && actorRole !== "ultra_admin") {
    throw new Error("Apenas Ultra Admin pode alterar outro Ultra Admin.");
  }
}

export function assertActorUltraForCreateUltra(
  actorRole: RoleId,
  newRole: RoleId,
): void {
  if (newRole === "ultra_admin" && actorRole !== "ultra_admin") {
    throw new Error("Apenas Ultra Admin pode criar outro Ultra Admin.");
  }
}
