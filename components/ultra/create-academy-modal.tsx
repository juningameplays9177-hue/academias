"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faMapLocationDot, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { AcademiaDTO } from "@/hooks/useAcademies";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/utils/cn";
import { isValidGoogleMapsUrl } from "@/lib/validation/google-maps-url";
import { slugifyBr } from "@/lib/utils/slugify";
import type { TenantAcademia } from "@/lib/tenant/branding";
import { sanitizeCorPrimaria } from "@/lib/tenant/branding";
import { tenantTheme } from "@/lib/tenant/theme";

type Props = {
  open: boolean;
  onClose: () => void;
  editing: AcademiaDTO | null;
  onAfterSave?: () => void;
  onCreate: (payload: {
    nome: string;
    slug?: string;
    cidade: string;
    estado: string;
    email: string;
    status: "ativo" | "inativa";
    logoUrl?: string | null;
    googleMapsUrl?: string | null;
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
  }) => Promise<AcademiaDTO | undefined>;
  onUpdate: (
    id: string,
    payload: Partial<{
      nome: string;
      slug: string;
      cidade: string;
      estado: string;
      email: string;
      status: "ativo" | "inativa";
      logoUrl: string | null;
      googleMapsUrl: string | null;
      endereco: string | null;
      telefone: string | null;
      instagram: string | null;
      tagline: string | null;
      corPrimaria: string | null;
      corPrimariaSecundaria: string | null;
      corPrimariaSuave: string | null;
      corFundo: string | null;
      corTexto: string | null;
      metaDescription: string | null;
    }>,
  ) => Promise<AcademiaDTO | undefined>;
};

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateAcademyModal({
  open,
  onClose,
  editing,
  onAfterSave,
  onCreate,
  onUpdate,
}: Props) {
  const { pushToast } = useToast();
  const isEdit = Boolean(editing);
  const [nome, setNome] = useState("");
  const [slugManual, setSlugManual] = useState("");
  const [slugAuto, setSlugAuto] = useState(true);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativa">("ativo");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoData, setLogoData] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tagline, setTagline] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#f97316");
  const [corPrimariaSecundaria, setCorPrimariaSecundaria] = useState("");
  const [corPrimariaSuave, setCorPrimariaSuave] = useState("");
  const [corFundo, setCorFundo] = useState("");
  const [corTexto, setCorTexto] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    if (editing) {
      setNome(editing.nome);
      setSlugManual(editing.slug);
      setSlugAuto(false);
      setCidade(editing.cidade ?? "");
      setEstado((editing.estado ?? "").toUpperCase());
      setEmail(editing.email ?? "");
      setStatus(editing.status);
      setLogoPreview(editing.logoUrl);
      setLogoData(editing.logoUrl);
      setGoogleMapsUrl(editing.googleMapsUrl ?? "");
      setEndereco(editing.endereco ?? "");
      setTelefone(editing.telefone ?? "");
      setInstagram(editing.instagram ?? "");
      setTagline(editing.tagline ?? "");
      setCorPrimaria(editing.corPrimaria?.trim() || "#f97316");
      setCorPrimariaSecundaria(editing.corPrimariaSecundaria ?? "");
      setCorPrimariaSuave(editing.corPrimariaSuave ?? "");
      setCorFundo(editing.corFundo ?? "");
      setCorTexto(editing.corTexto ?? "");
      setMetaDescription(editing.metaDescription ?? "");
    } else {
      setNome("");
      setSlugManual("");
      setSlugAuto(true);
      setCidade("");
      setEstado("");
      setEmail("");
      setStatus("ativo");
      setLogoPreview(null);
      setLogoData(null);
      setGoogleMapsUrl("");
      setEndereco("");
      setTelefone("");
      setInstagram("");
      setTagline("");
      setCorPrimaria("#f97316");
      setCorPrimariaSecundaria("");
      setCorPrimariaSuave("");
      setCorFundo("");
      setCorTexto("");
      setMetaDescription("");
    }
    setFormError(null);
  }, [editing]);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, editing, reset]);

  useEffect(() => {
    if (!open || isEdit || !slugAuto) return;
    setSlugManual(slugifyBr(nome));
  }, [nome, slugAuto, open, isEdit]);

  const previewAcademia: TenantAcademia = useMemo(
    () => ({
      id: editing?.id ?? "_preview",
      nome: nome.trim() || "Prévia da unidade",
      slug: editing?.slug ?? "slug",
      endereco: null,
      telefone: null,
      instagram: null,
      email: null,
      logoUrl: null,
      corPrimaria: corPrimaria.trim() || null,
      corPrimariaSecundaria: corPrimariaSecundaria.trim() || null,
      corPrimariaSuave: corPrimariaSuave.trim() || null,
      corFundo: corFundo.trim() || null,
      corTexto: corTexto.trim() || null,
      tagline: null,
      metaDescription: null,
      cidade: null,
      estado: null,
      googleMapsUrl: null,
    }),
    [
      editing?.id,
      editing?.slug,
      nome,
      corPrimaria,
      corPrimariaSecundaria,
      corPrimariaSuave,
      corFundo,
      corTexto,
    ],
  );

  const previewTheme = useMemo(() => tenantTheme(previewAcademia), [previewAcademia]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setFormError("Envie um arquivo de imagem (PNG, JPG, WebP).");
      return;
    }
    if (f.size > 700 * 1024) {
      setFormError("Imagem acima de 700 KB. Comprima ou escolha outro arquivo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r === "string") {
        setLogoData(r);
        setLogoPreview(r);
        setFormError(null);
      }
    };
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (nome.trim().length < 2) {
      setFormError("Nome muito curto.");
      return;
    }
    if (cidade.trim().length < 2) {
      setFormError("Informe a cidade.");
      return;
    }
    if (estado.trim().length !== 2) {
      setFormError("Estado: use 2 letras (ex.: RJ).");
      return;
    }
    if (!EMAIL_OK.test(email.trim())) {
      setFormError("E-mail inválido.");
      return;
    }
    if (!isValidGoogleMapsUrl(googleMapsUrl)) {
      setFormError(
        "Link do Google Maps inválido. Use o link de “Compartilhar” do Maps (maps.google.com, maps.app.goo.gl, etc.) ou deixe em branco.",
      );
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && editing) {
        const a = await onUpdate(editing.id, {
          nome: nome.trim(),
          slug: slugManual.trim() || undefined,
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          status,
          logoUrl: logoData,
          googleMapsUrl: googleMapsUrl.trim() || null,
          endereco: endereco.trim() || null,
          telefone: telefone.trim() || null,
          instagram: instagram.trim() || null,
          tagline: tagline.trim() || null,
          corPrimaria: corPrimaria.trim() || null,
          corPrimariaSecundaria: corPrimariaSecundaria.trim() || null,
          corPrimariaSuave: corPrimariaSuave.trim() || null,
          corFundo: corFundo.trim() || null,
          corTexto: corTexto.trim() || null,
          metaDescription: metaDescription.trim() || null,
        });
        if (a) {
          pushToast({
            type: "success",
            title: "Academia atualizada",
            description: `${a.nome} · @${a.slug}`,
          });
          onAfterSave?.();
        }
      } else {
        const a = await onCreate({
          nome: nome.trim(),
          slug: slugAuto ? undefined : slugManual.trim() || undefined,
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          status,
          logoUrl: logoData,
          googleMapsUrl: googleMapsUrl.trim() || null,
          endereco: endereco.trim() || null,
          telefone: telefone.trim() || null,
          instagram: instagram.trim() || null,
          tagline: tagline.trim() || null,
          corPrimaria: corPrimaria.trim() || null,
          corPrimariaSecundaria: corPrimariaSecundaria.trim() || null,
          corPrimariaSuave: corPrimariaSuave.trim() || null,
          corFundo: corFundo.trim() || null,
          corTexto: corTexto.trim() || null,
          metaDescription: metaDescription.trim() || null,
        });
        if (a) {
          const bits = [`${a.nome} · @${a.slug}`];
          if (a.publicSitePath) bits.push(`Página: ${a.publicSitePath}`);
          if (a.tenantStorePath) bits.push(`Banco da unidade: ${a.tenantStorePath}`);
          pushToast({
            type: "success",
            title: "Academia criada com sucesso",
            description: bits.join(" · "),
          });
          onAfterSave?.();
        }
      }
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveTheme() {
    if (!isEdit || !editing) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await onUpdate(editing.id, {
        corPrimaria: corPrimaria.trim() || null,
        corPrimariaSecundaria: corPrimariaSecundaria.trim() || null,
        corPrimariaSuave: corPrimariaSuave.trim() || null,
        corFundo: corFundo.trim() || null,
        corTexto: corTexto.trim() || null,
        /** Mesmo ao salvar só o tema, persiste WhatsApp/contato visíveis no formulário (evita perder o número). */
        telefone: telefone.trim() || null,
        /** Logo escolhido no modal (evita perder a foto se o ultra salvar só o tema). */
        logoUrl: logoData,
      });
      pushToast({
        type: "success",
        title: "Tema salvo",
        description:
          "Cores e WhatsApp da unidade atualizados. Quem já está logado vê a mudança ao recarregar.",
      });
      onAfterSave?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar tema");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="academy-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="academy-modal-title" className="text-lg font-semibold text-white">
            {isEdit ? "Editar academia" : "Nova academia"}
          </h2>
          <button
            type="button"
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-5 py-5">
          {formError ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {formError}
            </p>
          ) : null}

          <div>
            <label className="text-xs font-medium text-neutral-400">Nome da academia</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
              placeholder="Ex.: Arena Paulista · Pinheiros"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-neutral-400">Slug (URL)</label>
              {!isEdit ? (
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <input
                    type="checkbox"
                    checked={slugAuto}
                    onChange={(e) => setSlugAuto(e.target.checked)}
                  />
                  Gerar automaticamente
                </label>
              ) : null}
            </div>
            <input
              value={slugManual}
              onChange={(e) => {
                setSlugManual(e.target.value);
                if (!isEdit) setSlugAuto(false);
              }}
              disabled={!isEdit && slugAuto}
              className={cn(
                "mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 font-mono text-sm text-white outline-none focus:border-orange-500/60",
                !isEdit && slugAuto && "opacity-60",
              )}
              placeholder="beira-rio-fit"
            />
            <p className="mt-1 text-[11px] text-neutral-600">
              Preview: <span className="text-orange-300/90">@{slugifyBr(slugManual || nome || "slug")}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-400">Cidade</label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-400">UF</label>
              <input
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
                placeholder="SP"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/12 bg-black/35 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
              <FontAwesomeIcon icon={faMapLocationDot} className="text-orange-400/90" />
              Local no Google Maps
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
              Cole o link de <span className="text-neutral-400">Compartilhar</span> no app ou site do Google Maps
              (opcional).
            </p>
            <input
              type="url"
              inputMode="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500/60"
              placeholder="https://maps.app.goo.gl/…"
              autoComplete="off"
            />
          </div>

          <div className="rounded-xl border border-white/12 bg-black/35 p-4 space-y-3">
            <p className="text-xs font-semibold text-neutral-300">Identidade no site</p>
            <div>
              <label className="text-xs font-medium text-neutral-400">Endereço (cartão)</label>
              <textarea
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
                placeholder="Av. … — bairro, cidade — UF"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-400">
                  WhatsApp da unidade
                </label>
                <p className="mt-0.5 text-[10px] text-neutral-500">
                  Usado no site e no botão &quot;Pagar mensalidade&quot; do painel (link wa.me deste número).
                </p>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
                  placeholder="(11) 99999-9999 — mesmo número do WhatsApp"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">Instagram</label>
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
                  placeholder="@unidade"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-400">Tagline</label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
                placeholder="Bairro · posicionamento"
              />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] leading-relaxed text-neutral-500">
                Três tons em <span className="text-neutral-400">hex</span> (#rrggbb). Deixe em branco as
                duas últimas para gerar automaticamente a partir da principal.
              </p>
              <div>
                <label className="text-xs font-medium text-neutral-400">
                  1 · Primária principal (botões, ícones)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-black"
                    value={corPrimaria.startsWith("#") ? corPrimaria : "#f97316"}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                  />
                  <input
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-orange-500/60"
                    placeholder="#ea580c"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">
                  2 · Primária secundária (gradientes, faixas)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-black"
                    value={
                      corPrimariaSecundaria.startsWith("#")
                        ? corPrimariaSecundaria
                        : "#fb923c"
                    }
                    onChange={(e) => setCorPrimariaSecundaria(e.target.value)}
                  />
                  <input
                    value={corPrimariaSecundaria}
                    onChange={(e) => setCorPrimariaSecundaria(e.target.value)}
                    className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-orange-500/60"
                    placeholder="vazio = automático"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">
                  3 · Primária suave (fundos, bordas)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-black"
                    value={corPrimariaSuave.startsWith("#") ? corPrimariaSuave : "#7c2d12"}
                    onChange={(e) => setCorPrimariaSuave(e.target.value)}
                  />
                  <input
                    value={corPrimariaSuave}
                    onChange={(e) => setCorPrimariaSuave(e.target.value)}
                    className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-orange-500/60"
                    placeholder="vazio = automático"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/12 bg-black/25 p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-300">Tema global (painéis + site)</p>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                Fundo e texto da “casca” da aplicação. Vazio = padrão escuro (#000 / texto claro).
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-neutral-400">Cor de fundo</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-black"
                      value={
                        sanitizeCorPrimaria(corFundo) ??
                        previewTheme.shellBackground
                      }
                      onChange={(e) => setCorFundo(e.target.value)}
                    />
                    <input
                      value={corFundo}
                      onChange={(e) => setCorFundo(e.target.value)}
                      className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-orange-500/60"
                      placeholder="#0f172a (opcional)"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400">Cor do texto</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-black"
                      value={
                        sanitizeCorPrimaria(corTexto) ??
                        previewTheme.shellForeground
                      }
                      onChange={(e) => setCorTexto(e.target.value)}
                    />
                    <input
                      value={corTexto}
                      onChange={(e) => setCorTexto(e.target.value)}
                      className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-orange-500/60"
                      placeholder="#ffffff (opcional)"
                    />
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl border p-4 shadow-inner"
                style={{
                  backgroundColor: previewTheme.shellBackground,
                  color: previewTheme.shellForeground,
                  borderColor: previewTheme.shellBorder,
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
                  Prévia em tempo real
                </p>
                <p className="mt-2 text-sm font-semibold">{nome.trim() || "Nome da academia"}</p>
                <p className="mt-1 text-xs opacity-80">Subtítulo e área do painel usam estas cores.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium text-black"
                    style={{ backgroundColor: previewTheme.primary }}
                  >
                    Botão primário
                  </span>
                  <span
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{
                      borderColor: previewTheme.secondary,
                      color: previewTheme.secondary,
                    }}
                  >
                    Destaque
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-400">Meta description (SEO)</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                maxLength={320}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400">E-mail de contato</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
              placeholder="recepcao@academia.com.br"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "ativo" | "inativa")}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60"
            >
              <option value="ativo">Ativo</option>
              <option value="inativa">Inativo</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400">Logo</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs text-neutral-300 transition hover:border-orange-500/40 hover:text-white">
                <FontAwesomeIcon icon={faImage} />
                Carregar imagem
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
              {logoPreview ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Pré-visualização"
                    className="h-14 w-14 rounded-lg border border-white/10 object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-neutral-400 hover:text-white"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoData(null);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            {isEdit ? (
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                className="border bg-transparent hover:bg-white/5"
                style={{
                  borderColor: previewTheme.primary,
                  color: previewTheme.primary,
                }}
                onClick={() => void handleSaveTheme()}
              >
                {submitting ? "Salvando…" : "Salvar tema"}
              </Button>
            ) : null}
            <Button type="submit" disabled={submitting} className="min-w-[120px]">
              {submitting ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar academia"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
