import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { appendDefaultPlansForAcademia } from "@/lib/academies/academy-defaults";
import {
  serializeAcademia,
  uniqueSlugForDraft,
} from "@/lib/academies/academy-api-helpers";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { AcademiaRecord } from "@/lib/db/types";
import {
  isValidGoogleMapsUrl,
  normalizeGoogleMapsUrl,
} from "@/lib/validation/google-maps-url";
import { slugifyBr } from "@/lib/utils/slugify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertUltra() {
  return getServerSession().then((s) => {
    if (!s || s.role !== "ultra_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return null;
  });
}

export async function GET() {
  const denied = await assertUltra();
  if (denied) return denied;
  const db = await readDatabase();
  return NextResponse.json({
    academias: db.academias.map(serializeAcademia),
  });
}

export async function POST(request: Request) {
  const denied = await assertUltra();
  if (denied) return denied;

  const body = (await request.json()) as {
    nome?: string;
    slug?: string;
    cidade?: string;
    estado?: string;
    email?: string;
    status?: AcademiaRecord["status"];
    logoUrl?: string | null;
    googleMapsUrl?: string | null;
  };

  const nome = body.nome?.trim() ?? "";
  if (nome.length < 2) {
    return NextResponse.json(
      { error: "Informe o nome da academia (mín. 2 caracteres)." },
      { status: 400 },
    );
  }

  const cidade = body.cidade?.trim() ?? "";
  const estado = (body.estado?.trim() ?? "").toUpperCase().slice(0, 2);
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Informe um e-mail de contato válido." },
      { status: 400 },
    );
  }
  if (cidade.length < 2) {
    return NextResponse.json({ error: "Informe a cidade." }, { status: 400 });
  }
  if (estado.length !== 2) {
    return NextResponse.json(
      { error: "Use a sigla do estado com 2 letras (ex.: RJ, SP)." },
      { status: 400 },
    );
  }

  const status: AcademiaRecord["status"] =
    body.status === "inativa" ? "inativa" : "ativo";

  let logoUrl: string | null =
    typeof body.logoUrl === "string" && body.logoUrl.length > 0
      ? body.logoUrl
      : null;
  if (logoUrl && logoUrl.length > 900_000) {
    return NextResponse.json(
      { error: "Logo muito grande. Use uma imagem menor (máx. ~700 KB)." },
      { status: 400 },
    );
  }

  const mapsRaw =
    typeof body.googleMapsUrl === "string" ? body.googleMapsUrl : "";
  if (!isValidGoogleMapsUrl(mapsRaw)) {
    return NextResponse.json(
      {
        error:
          "Link do Google Maps inválido. Cole o link completo de “Compartilhar” (maps.google.com, maps.app.goo.gl, etc.).",
      },
      { status: 400 },
    );
  }
  const googleMapsUrl = normalizeGoogleMapsUrl(mapsRaw);

  const id = `acad_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const slugBase = body.slug?.trim() ? slugifyBr(body.slug) : slugifyBr(nome);

  const created = await mutateDatabase((draft) => {
    const slug = uniqueSlugForDraft(draft, slugBase);
    const row: AcademiaRecord = {
      id,
      nome,
      slug,
      status,
      logoUrl,
      plataformaDesligada: false,
      email,
      cidade,
      estado,
      googleMapsUrl,
    };
    draft.academias.push(row);
    if (status === "ativo") {
      appendDefaultPlansForAcademia(draft, id);
    }
    return row;
  });

  const db = await readDatabase();
  const a = db.academias.find((x) => x.id === created.id)!;
  return NextResponse.json(
    { ok: true, academia: serializeAcademia(a) },
    { status: 201 },
  );
}
