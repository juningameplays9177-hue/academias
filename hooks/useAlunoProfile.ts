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

export function useAlunoProfile() {
  const [data, setData] = useState<AlunoProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/aluno/me", { cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Erro ao carregar");
      }
      const json = (await res.json()) as AlunoProfilePayload;
      setData(json);
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
