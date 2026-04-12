"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import type { AttendanceRecord, ClassSlot, StudentRecord } from "@/lib/db/types";
import { useToast } from "@/contexts/toast-context";

export function ProfessorAttendanceClient() {
  const { pushToast } = useToast();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassSlot[]>([]);
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [presente, setPresente] = useState(true);

  const refresh = useCallback(async () => {
    const [sRes, cRes, aRes] = await Promise.all([
      fetch("/api/professor/students", { cache: "no-store" }),
      fetch("/api/professor/schedule", { cache: "no-store" }),
      fetch("/api/professor/attendance", { cache: "no-store" }),
    ]);
    if (sRes.ok) {
      const s = (await sRes.json()) as { students: StudentRecord[] };
      setStudents(s.students);
      setAlunoId((prev) => prev || s.students[0]?.id || "");
    }
    if (cRes.ok) {
      const c = (await cRes.json()) as { classes: ClassSlot[] };
      setClasses(c.classes);
      setAulaId((prev) => prev || c.classes[0]?.id || "");
    }
    if (aRes.ok) {
      const a = (await aRes.json()) as { attendance: AttendanceRecord[] };
      setRows(a.attendance);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const labelByAluno = useMemo(() => {
    const m = new Map<string, string>();
    students.forEach((s) => m.set(s.id, s.nome));
    return m;
  }, [students]);

  async function submit() {
    if (!alunoId || !aulaId) {
      pushToast({
        type: "error",
        title: "Faltou selecionar",
        description: "Precisa de aluno e aula.",
      });
      return;
    }
    const res = await fetch("/api/professor/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId, aulaId, presente }),
    });
    if (!res.ok) {
      pushToast({ type: "error", title: "Não registrou presença" });
      return;
    }
    pushToast({ type: "success", title: "Presença salva" });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Professor", href: "/professor" },
          { label: "Presença" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Presença</h1>
        <p className="mt-1 text-sm text-muted">
          Registro simples — depois a gente pluga leitor facial e fica chique.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-3">
        <label className="text-sm text-muted">
          Aluno
          <select
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted">
          Aula
          <select
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={aulaId}
            onChange={(e) => setAulaId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={presente}
            onChange={(e) => setPresente(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Presente
        </label>
        <div className="md:col-span-3 flex justify-end">
          <Button type="button" onClick={() => void submit()}>
            Registrar
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Últimos lançamentos</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {rows.slice(-8).reverse().map((r) => (
            <li key={r.id}>
              {labelByAluno.get(r.alunoId) ?? r.alunoId} ·{" "}
              {r.presente ? "presente" : "falta"} ·{" "}
              {new Date(r.dataISO).toLocaleString("pt-BR")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
