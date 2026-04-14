import { redirect } from "next/navigation";
import { redirectIfSiteLockedForNonUltra } from "@/lib/platform/redirect-if-site-locked";

/** Evita shell estático com `s-maxage` enorme na CDN (ex.: Hostinger hcdn) — reduz 503/HTML quebrado na borda. */
export const dynamic = "force-dynamic";

/** Entrada da aplicação: hub de unidades / login; site por unidade em `/a/[slug]` (legado `/site`). */
export default async function Home() {
  await redirectIfSiteLockedForNonUltra();
  redirect("/select-academia");
}
