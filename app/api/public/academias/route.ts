import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/db/file-store";

/** Lista academias ativas para o hub público (seleção visual antes do login). */
export async function GET() {
  const db = await readDatabase();
  const academias = (db.academias ?? [])
    .filter((a) => a.status === "ativo" && !a.plataformaDesligada)
    .map((a) => ({
      id: a.id,
      nome: a.nome,
      slug: a.slug,
      logoUrl: a.logoUrl ?? null,
      cidade: a.cidade ?? null,
      estado: a.estado ?? null,
      tagline: a.tagline ?? null,
      corPrimaria: a.corPrimaria ?? null,
      corPrimariaSecundaria: a.corPrimariaSecundaria ?? null,
      corPrimariaSuave: a.corPrimariaSuave ?? null,
    }));
  return NextResponse.json({ academias });
}
