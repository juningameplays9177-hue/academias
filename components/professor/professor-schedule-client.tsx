"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { ClassSlot } from "@/lib/db/types";

export function ProfessorScheduleClient() {
  const [classes, setClasses] = useState<ClassSlot[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/professor/schedule", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { classes: ClassSlot[] };
      setClasses(data.classes);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Professor", href: "/professor" },
          { label: "Agenda" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agenda de aulas</h1>
        <p className="mt-1 text-sm text-muted">
          Horários combinados com a operação — se mudar, avisa recepção antes de
          postar story.
        </p>
      </div>
      <div className="space-y-3">
        {classes.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma aula cadastrada pra você ainda.</p>
        ) : (
          classes.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-semibold">{c.titulo}</p>
                <p className="text-xs capitalize text-muted">
                  {c.diaSemana} · {c.horario}
                </p>
              </div>
              <span className="text-xs text-muted">{c.vagas} vagas máx.</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
