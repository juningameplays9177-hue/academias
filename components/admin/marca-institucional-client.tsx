"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faImage } from "@fortawesome/free-solid-svg-icons";
import type { TenantAcademia } from "@/lib/tenant/branding";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/hooks/useAuth";

export function MarcaInstitucionalClient() {
  const { pushToast } = useToast();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<TenantAcademia>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/academia-branding", { cache: "no-store" });
      const j = (await res.json()) as { academia?: TenantAcademia; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Erro ao carregar");
      if (j.academia) setForm(j.academia);
    } catch (e) {
      pushToast({
        type: "error",
        title: "Não carregou",
        description: e instanceof Error ? e.message : "Erro",
      });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void load();
  }, [load]);

  function onFileLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      pushToast({ type: "error", title: "Envie uma imagem" });
      return;
    }
    if (f.size > 700 * 1024) {
      pushToast({ type: "error", title: "Máx. 700 KB" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r === "string") setForm((p) => ({ ...p, logoUrl: r }));
    };
    reader.readAsDataURL(f);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/academia-branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endereco: form.endereco ?? null,
          telefone: form.telefone ?? null,
          instagram: form.instagram ?? null,
          tagline: form.tagline ?? null,
          corPrimaria: form.corPrimaria ?? null,
          corPrimariaSecundaria: form.corPrimariaSecundaria ?? null,
          corPrimariaSuave: form.corPrimariaSuave ?? null,
          metaDescription: form.metaDescription ?? null,
          logoUrl: form.logoUrl ?? null,
          googleMapsUrl: form.googleMapsUrl ?? null,
          email: form.email ?? "",
          cidade: form.cidade ?? "",
          estado: form.estado ?? "",
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Erro ao salvar");
      pushToast({ type: "success", title: "Marca atualizada", description: "Site e painéis refletem as mudanças." });
      await refresh();
      await load();
    } catch (err) {
      pushToast({
        type: "error",
        title: "Falha ao salvar",
        description: err instanceof Error ? err.message : "Erro",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Carregando dados da unidade…</p>;
  }

  const field =
    "mt-1 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/60";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Marca e site institucional</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Estes dados aparecem no site público da sua unidade e nos cabeçalhos dos painéis (nome,
          logo, contatos e cor).
        </p>
      </div>

      <form onSubmit={(e) => void save(e)} className="max-w-2xl space-y-4">
        <div>
          <label className="text-xs font-medium text-neutral-400">Nome da unidade</label>
          <input className={field} value={form.nome ?? ""} disabled readOnly />
          <p className="mt-1 text-[11px] text-neutral-600">Alteração de nome é feita pelo Ultra Admin.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-400">Tagline (subtítulo no site)</label>
          <input
            className={field}
            value={form.tagline ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
            placeholder="Bairro · posicionamento"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-400">Endereço completo</label>
          <textarea
            className={`${field} min-h-[72px]`}
            value={form.endereco ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))}
            placeholder="Av., número, complemento — bairro, cidade — UF"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-neutral-400">
              WhatsApp da unidade
            </label>
            <input
              className={field}
              value={form.telefone ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-400">Instagram</label>
            <input
              className={field}
              value={form.instagram ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
              placeholder="@suaacademia"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-neutral-400">Cidade</label>
            <input
              className={field}
              value={form.cidade ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-400">UF</label>
            <input
              className={field}
              maxLength={2}
              value={form.estado ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, estado: e.target.value.toUpperCase().slice(0, 2) }))
              }
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-400">E-mail de contato</label>
          <input
            type="email"
            className={field}
            value={form.email ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
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
                className="h-10 w-14 cursor-pointer rounded border border-white/15 bg-black"
                value={form.corPrimaria?.match(/^#/) ? form.corPrimaria : "#f97316"}
                onChange={(e) => setForm((p) => ({ ...p, corPrimaria: e.target.value }))}
              />
              <input
                className={`${field} flex-1 font-mono text-xs`}
                value={form.corPrimaria ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, corPrimaria: e.target.value }))}
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
                className="h-10 w-14 cursor-pointer rounded border border-white/15 bg-black"
                value={
                  (form.corPrimariaSecundaria ?? "").startsWith("#")
                    ? form.corPrimariaSecundaria!
                    : "#fb923c"
                }
                onChange={(e) =>
                  setForm((p) => ({ ...p, corPrimariaSecundaria: e.target.value }))
                }
              />
              <input
                className={`${field} flex-1 font-mono text-xs`}
                value={form.corPrimariaSecundaria ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, corPrimariaSecundaria: e.target.value }))
                }
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
                className="h-10 w-14 cursor-pointer rounded border border-white/15 bg-black"
                value={
                  (form.corPrimariaSuave ?? "").startsWith("#")
                    ? form.corPrimariaSuave!
                    : "#7c2d12"
                }
                onChange={(e) => setForm((p) => ({ ...p, corPrimariaSuave: e.target.value }))}
              />
              <input
                className={`${field} flex-1 font-mono text-xs`}
                value={form.corPrimariaSuave ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, corPrimariaSuave: e.target.value }))}
                placeholder="vazio = automático"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-400">Meta description (SEO)</label>
          <textarea
            className={`${field} min-h-[80px]`}
            value={form.metaDescription ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
            maxLength={320}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-400">Link Google Maps</label>
          <input
            className={field}
            value={form.googleMapsUrl ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, googleMapsUrl: e.target.value }))}
            placeholder="https://maps.app.goo.gl/…"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-400">Logo</label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs text-neutral-300 transition hover:border-orange-500/40 hover:text-white">
              <FontAwesomeIcon icon={faImage} />
              Carregar
              <input type="file" accept="image/*" className="hidden" onChange={onFileLogo} />
            </label>
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logoUrl} alt="" className="h-14 w-14 rounded-lg border border-white/10 object-cover" />
            ) : null}
          </div>
        </div>

        <Button type="submit" disabled={saving} className="gap-2">
          <FontAwesomeIcon icon={faFloppyDisk} className="text-xs" />
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
