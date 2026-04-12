import { NextResponse } from "next/server";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { AcademiaRecord } from "@/lib/db/types";
import { requireTenantAdminContext } from "@/lib/tenancy/require-tenant-api";
import {
  isValidGoogleMapsUrl,
  normalizeGoogleMapsUrl,
} from "@/lib/validation/google-maps-url";
import { recordToTenantAcademia, sanitizeCorPrimaria } from "@/lib/tenant/branding";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;
  const a = ctx.db.academias.find((x) => x.id === ctx.tenantId);
  if (!a) {
    return NextResponse.json({ error: "Academia não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ academia: recordToTenantAcademia(a) });
}

export async function PATCH(request: Request) {
  const ctx = await requireTenantAdminContext();
  if (ctx instanceof NextResponse) return ctx;

  const body = (await request.json()) as {
    endereco?: string | null;
    telefone?: string | null;
    instagram?: string | null;
    tagline?: string | null;
    corPrimaria?: string | null;
    corPrimariaSecundaria?: string | null;
    corPrimariaSuave?: string | null;
    metaDescription?: string | null;
    logoUrl?: string | null;
    googleMapsUrl?: string | null;
    email?: string;
    cidade?: string;
    estado?: string;
  };

  if (typeof body.logoUrl === "string" && body.logoUrl.length > 900_000) {
    return NextResponse.json({ error: "Logo muito grande." }, { status: 400 });
  }

  if ("googleMapsUrl" in body) {
    const raw =
      body.googleMapsUrl === null || body.googleMapsUrl === undefined
        ? ""
        : String(body.googleMapsUrl);
    if (!isValidGoogleMapsUrl(raw)) {
      return NextResponse.json(
        { error: "Link do Google Maps inválido ou deixe em branco." },
        { status: 400 },
      );
    }
  }

  if (!ctx.db.academias.some((x) => x.id === ctx.tenantId)) {
    return NextResponse.json({ error: "Academia não encontrada." }, { status: 404 });
  }

  await mutateDatabase((draft) => {
    const a = draft.academias.find((x) => x.id === ctx.tenantId)!;
    patchBranding(a, body);
    return a;
  });

  const db = await readDatabase();
  const a = db.academias.find((x) => x.id === ctx.tenantId)!;
  return NextResponse.json({ ok: true, academia: recordToTenantAcademia(a) });
}

type BrandingPatch = {
  endereco?: string | null;
  telefone?: string | null;
  instagram?: string | null;
  tagline?: string | null;
  corPrimaria?: string | null;
  corPrimariaSecundaria?: string | null;
  corPrimariaSuave?: string | null;
  metaDescription?: string | null;
  logoUrl?: string | null;
  googleMapsUrl?: string | null;
  email?: string;
  cidade?: string;
  estado?: string;
};

function patchBranding(a: AcademiaRecord, body: BrandingPatch) {
  if (body.endereco !== undefined) {
    a.endereco =
      body.endereco === null ? null : String(body.endereco).trim() || null;
  }
  if (body.telefone !== undefined) {
    a.telefone =
      body.telefone === null ? null : String(body.telefone).trim() || null;
  }
  if (body.instagram !== undefined) {
    a.instagram =
      body.instagram === null ? null : String(body.instagram).trim() || null;
  }
  if (body.tagline !== undefined) {
    a.tagline = body.tagline === null ? null : String(body.tagline).trim() || null;
  }
  if (body.metaDescription !== undefined) {
    a.metaDescription =
      body.metaDescription === null
        ? null
        : String(body.metaDescription).trim().slice(0, 320) || null;
  }
  if (body.corPrimaria !== undefined) {
    a.corPrimaria =
      body.corPrimaria === null
        ? null
        : sanitizeCorPrimaria(String(body.corPrimaria));
  }
  if (body.corPrimariaSecundaria !== undefined) {
    a.corPrimariaSecundaria =
      body.corPrimariaSecundaria === null
        ? null
        : sanitizeCorPrimaria(String(body.corPrimariaSecundaria));
  }
  if (body.corPrimariaSuave !== undefined) {
    a.corPrimariaSuave =
      body.corPrimariaSuave === null
        ? null
        : sanitizeCorPrimaria(String(body.corPrimariaSuave));
  }
  if (body.logoUrl !== undefined) {
    a.logoUrl =
      body.logoUrl === null ? null : typeof body.logoUrl === "string" ? body.logoUrl : null;
  }
  if (body.googleMapsUrl !== undefined) {
    a.googleMapsUrl =
      body.googleMapsUrl === null
        ? null
        : normalizeGoogleMapsUrl(String(body.googleMapsUrl).trim());
  }
  if (body.email !== undefined) {
    const em = String(body.email).trim().toLowerCase();
    if (EMAIL_RE.test(em)) a.email = em;
  }
  if (body.cidade !== undefined) {
    const c = String(body.cidade).trim();
    if (c.length >= 2) a.cidade = c;
  }
  if (body.estado !== undefined) {
    const e = String(body.estado).trim().toUpperCase().slice(0, 2);
    if (e.length === 2) a.estado = e;
  }
}
