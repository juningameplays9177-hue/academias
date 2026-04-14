import { redirect } from "next/navigation";
import { redirectIfSiteLockedForNonUltra } from "@/lib/platform/redirect-if-site-locked";

/** Entrada da aplicação: hub de unidades / login; site por unidade em `/a/[slug]` (legado `/site`). */
export default async function Home() {
  await redirectIfSiteLockedForNonUltra();
  redirect("/select-academia");
}
