import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AcademiaPublicPage } from "@/components/tenant/academia-public-page";
import { readDatabase } from "@/lib/db/file-store";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";
import { defaultMetaDescription, recordToTenantAcademia } from "@/lib/tenant/branding";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).trim();
  const db = await readDatabase();
  const a = db.academias.find((x) => x.slug.toLowerCase() === slug.toLowerCase());
  if (!a || a.status !== "ativo") {
    return { title: "Unidade" };
  }
  const t = recordToTenantAcademia(a);
  return {
    title: `${a.nome} · PowerFit`,
    description: defaultMetaDescription(t),
  };
}

export default async function AcademiaPublicRoutePage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).trim();
  if (!slug) notFound();

  const db = await readDatabase();
  const a = db.academias.find((x) => x.slug.toLowerCase() === slug.toLowerCase());
  if (!a || a.status !== "ativo") notFound();
  if (isAcademiaPlataformaDesligada(db, a.id)) notFound();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-tenant-shell-bg text-neutral-400">
          Carregando site…
        </div>
      }
    >
      <AcademiaPublicPage slug={a.slug} />
    </Suspense>
  );
}
