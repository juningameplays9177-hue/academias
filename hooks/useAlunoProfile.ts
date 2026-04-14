"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ClassSlot,
  NoticeRecord,
  PlanRecord,
  ProfessorRecord,
  StudentRecord,
} from "@/lib/db/types";

export type AlunoProfilePayload = {
  student: StudentRecord;
  plan: PlanRecord | undefined;
  professor: ProfessorRecord | undefined;
  notices: NoticeRecord[];
  classes: ClassSlot[];
};

function parseApiBody(text: string): unknown {
  const t = text.trim();
  if (!t) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    if (t.startsWith("<!DOCTYPE") || t.startsWith("<html")) {
      throw new Error(
        "Não foi possível carregar seus dados (sessão ou servidor). Atualize a página ou entre de novo.",
      );
    }
    throw new Error("Resposta inválida do servidor.");
  }
}

export function useAlunoProfile() {
  const [data, setData] = useState<AlunoProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/aluno/me", { cache: "no-store" });
      const text = await res.text();
      const parsed = parseApiBody(text) as
        | (AlunoProfilePayload & { error?: string })
        | { error?: string }
        | null;

      if (!res.ok) {
        const msg =
          parsed &&
          typeof parsed === "object" &&
          "error" in parsed &&
          typeof (parsed as { error?: string }).error === "string"
            ? (parsed as { error: string }).error
            : `Erro ao carregar (${res.status})`;
        throw new Error(msg);
      }

      if (!parsed || typeof parsed !== "object" || !("student" in parsed)) {
        throw new Error("Resposta incompleta do servidor.");
      }

      setData(parsed as AlunoProfilePayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
