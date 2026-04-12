import type { Metadata } from "next";
import { MensalidadePageClient } from "@/components/mensalidade/mensalidade-page-client";

export const metadata: Metadata = {
  title: "Mensalidade",
  description: "Planos da unidade e pagamento via WhatsApp.",
};

export default function MensalidadePage() {
  return <MensalidadePageClient />;
}
