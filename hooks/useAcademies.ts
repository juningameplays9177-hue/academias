"use client";

import { useCallback, useState } from "react";
import type { AcademiaApiShape } from "@/lib/academies/academy-api-helpers";

export type AcademiaDTO = AcademiaApiShape;

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
    const j = (await res.json()) as { academia?: AcademiaDTO; error?: string };
    if (!res.ok) {
      throw new Error(j.error ?? "Erro ao criar");
    }
    if (j.academia) {
      setAcademias((prev) => [...prev, j.academia!].sort((a, b) => a.nome.localeCompare(b.nome)));
    }
    return j.academia;
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
