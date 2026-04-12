import { Suspense } from "react";
import { MarketingPage } from "@/components/marketing/marketing-page";

export default function SitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-neutral-400">
          Carregando site…
        </div>
      }
    >
      <MarketingPage />
    </Suspense>
  );
}
