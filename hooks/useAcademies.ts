"use client";

import { useCallback, useState } from "react";
import type { AcademiaApiShape } from "@/lib/academies/academy-api-helpers";

export type AcademiaDTO = AcademiaApiShape & {
  /** Só na resposta de criação (POST): URL pública dedicada da unidade. */
  publicSitePath?: string;
  /** Só na resposta de criação: arquivo JSON isolado com alunos, planos, etc. */
  tenantStorePath?: string;
};

type CreatePayload = {
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
};

type UpdatePayload = Partial<CreatePayload> & {
  plataformaDesligada?: boolean;
  logoUrl?: string | null;
};

export function useAcademies() {
  const [academias, setAcademias] = useState<AcademiaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAcademies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/academias", { cache: "no-store" });
      const j = (await res.json()) as { academias?: AcademiaDTO[]; error?: string };
      if (!res.ok) {
        setAcademias([]);
        setError(j.error ?? "Erro ao listar");
        return;
      }
      setAcademias(j.academias ?? []);
    } catch {
      setAcademias([]);
      setError("Falha de rede");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAcademy = useCallback(async (payload: CreatePayload) => {
    const res = await fetch("/api/academias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = (await res.json()) as {
      academia?: AcademiaApiShape;
      publicSitePath?: string;
      tenantStorePath?: string;
      error?: string;
    };
    if (!res.ok) {
      throw new Error(j.error ?? "Erro ao criar");
    }
    if (j.academia) {
      const row: AcademiaDTO = {
        ...j.academia,
        publicSitePath: j.publicSitePath,
        tenantStorePath: j.tenantStorePath,
      };
      setAcademias((prev) => [...prev, row].sort((a, b) => a.nome.localeCompare(b.nome)));
      return row;
    }
    return undefined;
  }, []);

  const updateAcademy = useCallback(async (id: string, payload: UpdatePayload) => {
    const res = await fetch(`/api/academias/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = (await res.json()) as { academia?: AcademiaDTO; error?: string };
    if (!res.ok) {
      throw new Error(j.error ?? "Erro ao atualizar");
    }
    if (j.academia) {
      setAcademias((prev) =>
        prev.map((a) => (a.id === j.academia!.id ? j.academia! : a)),
      );
    }
    return j.academia;
  }, []);

  const deleteAcademy = useCallback(async (id: string) => {
    const res = await fetch(`/api/academias/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(j.error ?? "Erro ao excluir");
    }
    setAcademias((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    academias,
    loading,
    error,
    getAcademies,
    createAcademy,
    updateAcademy,
    deleteAcademy,
  };
}
