import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/get-server-session";
import { readPlatformRegistryPublic } from "@/lib/db/file-store";
import { isSitePublicOff } from "@/lib/platform/site-public-off";

/** Quando o proxy não roda na rota, mantém o bloqueio “site público desligado” no servidor. */
export async function redirectIfSiteLockedForNonUltra(): Promise<void> {
  const platform = await readPlatformRegistryPublic();
  if (!isSitePublicOff(platform)) return;
  const session = await getServerSession();
  if (session?.role === "ultra_admin") return;
  redirect("/manutencao");
}
