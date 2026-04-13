import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { homePathForRole } from "@/lib/rbac/home-path";
import { isRoleId } from "@/lib/rbac/roles";
import { SelectAcademiaClient } from "@/components/tenant/select-academia-client";

export default async function SelectAcademiaPage() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;

  if (!session) {
    redirect("/login");
  }

  if (!session.needsTenantSelection) {
    const role = isRoleId(session.role) ? session.role : "aluno";
    redirect(homePathForRole(role));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mt-10">
          <SelectAcademiaClient />
        </div>
      </div>
    </div>
  );
}
