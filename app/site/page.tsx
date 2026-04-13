import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { academiaPublicSitePath } from "@/lib/routes/academia-public-path";

type Props = { searchParams: Promise<{ unidade?: string }> };

export default async function SitePage({ searchParams }: Props) {
  const sp = await searchParams;
  const u = sp.unidade?.trim();
  if (u) {
    redirect(academiaPublicSitePath(u));
  }
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
