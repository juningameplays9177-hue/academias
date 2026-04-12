import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import {
  countAcademiaRefs,
  serializeAcademia,
  totalRefs,
  uniqueSlugForDraft,
} from "@/lib/academies/academy-api-helpers";
import { appendDefaultPlansForAcademia } from "@/lib/academies/academy-defaults";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import type { AcademiaRecord } from "@/lib/db/types";
import {
  isValidGoogleMapsUrl,
  normalizeGoogleMapsUrl,
} from "@/lib/validation/google-maps-url";
import { sanitizeCorPrimaria } from "@/lib/tenant/branding";
import { slugifyBr } from "@/lib/utils/slugify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Ctx = { params: Promise<{ id: string }> };

async function assertUltra() {
  const s = await getServerSession();
  if (!s || s.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const denied = await assertUltra();
  if (denied) return denied;

  const { id: rawId } = await ctx.params;
  const id = decodeURIComponent(rawId);
  const body = (await request.json()) as {
    nome?: string;
    slug?: string;
    cidade?: string;
    estado?: string;
    email?: string;
    status?: AcademiaRecord["status"];
    logoUrl?: string | null;
    googleMapsUrl?: string | null;
    plataformaDesligada?: boolean;
    endereco?: string | null;
    telefone?: string | null;
    instagram?: string | null;
    tagline?: string | null;
    corPrimaria?: string | null;
    corPrimariaSecundaria?: string | null;
    corPrimariaSuave?: string | null;
    corFundo?: string | null;
    corTexto?: string | null;
    metaDescription?: string | null;
  };

  if ("googleMapsUrl" in body) {
    const mapsRaw =
      body.googleMapsUrl === null || body.googleMapsUrl === undefined
        ? ""
        : typeof body.googleMapsUrl === "string"
          ? body.googleMapsUrl
          : "";
    if (!isValidGoogleMapsUrl(mapsRaw)) {
      return NextResponse.json(
        {
          error:
            "Link do Google Maps inválido. Cole o link completo de “Compartilhar” (maps.google.com, maps.app.goo.gl, etc.).",
        },
        { status: 400 },
      );
    }
  }

  if (typeof body.logoUrl === "string" && body.logoUrl.length > 900_000) {
    return NextResponse.json(
      { error: "Logo muito grande. Use uma imagem menor." },
      { status: 400 },
    );
  }

  const updated = await mutateDatabase((draft) => {
    const a = draft.academias.find((x) => x.id === id);
    if (!a) return null;

    if (typeof body.plataformaDesligada === "boolean") {
      a.plataformaDesligada = body.plataformaDesligada;
    }
    if (typeof body.nome === "string") {
      const n = body.nome.trim();
      if (n.length >= 2) a.nome = n;
    }
    if (typeof body.slug === "string" && body.slug.trim()) {
      const next = uniqueSlugForDraft(draft, slugifyBr(body.slug), id);
      a.slug = next;
    }
    if (typeof body.cidade === "string") {
      const c = body.cidade.trim();
      if (c.length >= 2) a.cidade = c;
    }
    if (typeof body.estado === "string") {
      const e = body.estado.trim().toUpperCase().slice(0, 2);
      if (e.length === 2) a.estado = e;
    }
    if (typeof body.email === "string") {
      const em = body.email.trim().toLowerCase();
      if (EMAIL_RE.test(em)) a.email = em;
    }
    if (body.status === "ativo" || body.status === "inativa") {
      const wasInactive = a.status === "inativa";
      a.status = body.status;
      if (wasInactive && body.status === "ativo") {
        const hasPlans = draft.plans.some((p) => p.academiaId === id);
        if (!hasPlans) appendDefaultPlansForAcademia(draft, id);
      }
    }
    if (body.logoUrl === null) {
      a.logoUrl = null;
    } else if (typeof body.logoUrl === "string") {
      a.logoUrl = body.logoUrl;
    }
    if (body.googleMapsUrl === null) {
      a.googleMapsUrl = null;
    } else if (typeof body.googleMapsUrl === "string") {
      a.googleMapsUrl = normalizeGoogleMapsUrl(body.googleMapsUrl.trim());
    }
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
    if (body.corPrimaria === null) {
      a.corPrimaria = null;
    } else if (typeof body.corPrimaria === "string") {
      const c = sanitizeCorPrimaria(body.corPrimaria);
      a.corPrimaria = c;
    }
    if (body.corPrimariaSecundaria === null) {
      a.corPrimariaSecundaria = null;
    } else if (body.corPrimariaSecundaria !== undefined) {
      a.corPrimariaSecundaria = sanitizeCorPrimaria(String(body.corPrimariaSecundaria));
    }
    if (body.corPrimariaSuave === null) {
      a.corPrimariaSuave = null;
    } else if (body.corPrimariaSuave !== undefined) {
      a.corPrimariaSuave = sanitizeCorPrimaria(String(body.corPrimariaSuave));
    }
    if (body.corFundo === null) {
      a.corFundo = null;
    } else if (body.corFundo !== undefined) {
      a.corFundo = sanitizeCorPrimaria(String(body.corFundo));
    }
    if (body.corTexto === null) {
      a.corTexto = null;
    } else if (body.corTexto !== undefined) {
      a.corTexto = sanitizeCorPrimaria(String(body.corTexto));
    }

    return a;
  });

  if (updated === null) {
    return NextResponse.json({ error: "Academia não encontrada." }, { status: 404 });
  }

  const db = await readDatabase();
  const a = db.academias.find((x) => x.id === id)!;
  return NextResponse.json({ ok: true, academia: serializeAcademia(a) });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const denied = await assertUltra();
  if (denied) return denied;

  const { id: rawId } = await ctx.params;
  const id = decodeURIComponent(rawId);

  const result = await mutateDatabase((draft) => {
    const idx = draft.academias.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false as const, reason: "not_found" as const };
    const refs = countAcademiaRefs(draft, id);
    if (totalRefs(refs) > 0) {
      return { ok: false as const, reason: "has_refs" as const, refs };
    }
    draft.academias.splice(idx, 1);
    draft.plans = draft.plans.filter((p) => p.academiaId !== id);
    return { ok: true as const };
  });

  if (!result.ok) {
    if (result.reason === "not_found") {
      return NextResponse.json({ error: "Academia não encontrada." }, { status: 404 });
    }
    return NextResponse.json(
      {
        error:
          "Não é possível excluir: existem usuários, alunos, professores ou outros dados vinculados a esta unidade. Desative (status inativa) ou remova os vínculos antes.",
        ...(result.reason === "has_refs" ? { refs: result.refs } : {}),
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
