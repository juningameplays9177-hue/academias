import { redirect } from "next/navigation";

/** Entrada da aplicação: hub de unidade / login; site institucional em `/site`. */
export default function Home() {
  redirect("/select-academia");
}
