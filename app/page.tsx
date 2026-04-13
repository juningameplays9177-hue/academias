import { redirect } from "next/navigation";

/** Entrada da aplicação: hub de unidades / login; site por unidade em `/a/[slug]` (legado `/site`). */
export default function Home() {
  redirect("/select-academia");
}
