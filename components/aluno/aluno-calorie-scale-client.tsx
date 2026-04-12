"use client";

import { useCallback, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlunoProfile } from "@/hooks/useAlunoProfile";
import { useToast } from "@/contexts/toast-context";
import { brDateKey, formatDateKeyPt, lastNBrDateKeys } from "@/lib/date/br-date-key";
import {
  badgeClassDiaKcalStatus,
  labelDiaKcalStatus,
  statusConsumoDia,
} from "@/lib/nutrition/kcal-day-status";
import { cn } from "@/lib/utils/cn";
import {
  CUSTOM_FOOD_ID,
  FOOD_PRESETS,
  filterFoodPresets,
  kcalForPortion,
  type FoodPreset,
} from "@/lib/nutrition/food-presets";

type Row = {
  id: string;
  foodId: string;
  foodSearch: string;
  customKcal100: string;
  quantidade: string;
  pesoGrams: string;
};

function presetById(id: string): FoodPreset | undefined {
  return FOOD_PRESETS.find((f) => f.id === id);
}

function rowKcal(r: Row): number {
  const q = Math.max(0, Number(r.quantidade.replace(",", ".")) || 0);
  const p = Math.max(0, Number(r.pesoGrams.replace(",", ".")) || 0);
  let k100 = 0;
  if (r.foodId === CUSTOM_FOOD_ID) {
    k100 = Math.max(0, Number(r.customKcal100.replace(",", ".")) || 0);
  } else {
    k100 = presetById(r.foodId)?.kcalPer100g ?? 0;
  }
  return kcalForPortion(k100, p, q);
}

function newRow(): Row {
  return {
    id: crypto.randomUUID(),
    foodId: FOOD_PRESETS[0]?.id ?? CUSTOM_FOOD_ID,
    foodSearch: "",
    customKcal100: "",
    quantidade: "1",
    pesoGrams: "",
  };
}

export function AlunoCalorieScaleClient() {
  const { data: profile, loading: profileLoading, refresh } = useAlunoProfile();
  const { pushToast } = useToast();
  const [rows, setRows] = useState<Row[]>(() => [newRow()]);
  const [registrando, setRegistrando] = useState(false);

  const totais = useMemo(() => {
    let kcal = 0;
    let gramas = 0;
    for (const r of rows) {
      const q = Math.max(0, Number(r.quantidade.replace(",", ".")) || 0);
      const p = Math.max(0, Number(r.pesoGrams.replace(",", ".")) || 0);
      kcal += rowKcal(r);
      gramas += p * q;
    }
    return { kcal, gramas };
  }, [rows]);

  const hojeKey = brDateKey();

  const historico = useMemo(() => {
    const meta = profile?.student?.metaKcalDia;
    const map = profile?.student?.consumoKcalPorDia ?? {};
    return lastNBrDateKeys(28).map((dateKey) => {
      const total = map[dateKey] ?? 0;
      return {
        dateKey,
        total,
        status: statusConsumoDia(total, meta),
      };
    });
  }, [profile?.student?.consumoKcalPorDia, profile?.student?.metaKcalDia]);

  const kcalRegistradasHoje = profile?.student?.consumoKcalPorDia?.[hojeKey] ?? 0;
  const metaDia = profile?.student?.metaKcalDia;

  const registrarSimulacaoNoDia = useCallback(async () => {
    const kcal = Math.round(totais.kcal);
    if (kcal <= 0) {
      pushToast({
        type: "error",
        title: "Nada para registrar",
        description: "Monte uma refeição com kcal maior que zero na simulação.",
      });
      return;
    }
    setRegistrando(true);
    try {
      const res = await fetch("/api/aluno/kcal-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kcal, dateKey: brDateKey() }),
      });
      const body = (await res.json()) as { error?: string; totalDia?: number };
      if (!res.ok) {
        pushToast({
          type: "error",
          title: "Não registrou",
          description: body.error,
        });
        return;
      }
      pushToast({
        type: "success",
        title: "Refeição somada ao dia",
        description: `Total registrado hoje: ${(body.totalDia ?? 0).toLocaleString("pt-BR")} kcal.`,
      });
      await refresh();
    } catch {
      pushToast({ type: "error", title: "Falha de rede" });
    } finally {
      setRegistrando(false);
    }
  }, [pushToast, refresh, totais.kcal]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Aluno", href: "/aluno" },
          { label: "Balança (kcal)" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Balança digital — calorias
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-400">
          Use a <strong className="text-neutral-200">busca</strong> para achar entre {FOOD_PRESETS.length} alimentos,
          depois informe a <strong className="text-neutral-200">quantidade de porções</strong> e o{" "}
          <strong className="text-neutral-200">peso em gramas de cada porção</strong>. O total de kcal é estimado
          (referência aproximada).
        </p>
      </div>

      {!profileLoading && profile?.student?.metaKcalDia != null ? (
        <div className="rounded-2xl border border-white/15 bg-neutral-900/90 p-4 text-sm text-neutral-200">
          <p className="font-medium text-white">Meta diária do seu professor</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-orange-300">
            {profile.student.metaKcalDia.toLocaleString("pt-BR")}{" "}
            <span className="text-sm font-normal text-neutral-400">kcal/dia</span>
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Compare com a estimativa da refeição abaixo. Valores da balança são aproximados.
          </p>
        </div>
      ) : !profileLoading ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-neutral-950/50 p-4 text-sm text-neutral-500">
          Seu professor ainda não definiu uma meta calórica diária para você. Quando definir, ela aparece aqui.
        </div>
      ) : null}

      {!profileLoading ? (
        <section className="rounded-2xl border border-white/10 bg-neutral-950/90 p-4">
          <h2 className="text-sm font-semibold text-white">
            Consumo registrado hoje ({formatDateKeyPt(hojeKey)})
          </h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
            {kcalRegistradasHoje.toLocaleString("pt-BR")}{" "}
            <span className="text-base font-normal text-neutral-500">kcal</span>
          </p>
          {metaDia != null ? (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((kcalRegistradasHoje / metaDia) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Meta {metaDia.toLocaleString("pt-BR")} kcal/dia · hoje:{" "}
                <span className="font-medium text-neutral-300">
                  {labelDiaKcalStatus(statusConsumoDia(kcalRegistradasHoje, metaDia))}
                </span>
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Sem meta diária cadastrada — o histórico marca “sem meta” até o professor definir.
            </p>
          )}
        </section>
      ) : null}

      <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-50">
        <p className="font-medium text-white">Total estimado desta refeição (simulação)</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-orange-300">
          {totais.kcal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kcal
        </p>
        <p className="mt-1 text-xs text-orange-100/80">
          Soma de {rows.length} item(ns) · ~{Math.round(totais.gramas)} g no total
        </p>
        {profile?.student?.metaKcalDia != null && totais.kcal > 0 ? (
          <p className="mt-3 border-t border-orange-500/25 pt-3 text-xs text-orange-100/90">
            Em relação à meta diária ({profile.student.metaKcalDia.toLocaleString("pt-BR")} kcal), esta simulação
            representa cerca de{" "}
            <span className="font-semibold text-white">
              {Math.min(100, Math.round((totais.kcal / profile.student.metaKcalDia) * 100))}%
            </span>{" "}
            do dia — só um lembrete visual, não é prescrição automática de refeições.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-orange-500/25 bg-orange-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-300">
          Quando a simulação bater com o que você comeu, registre — o valor entra no total do dia e no histórico
          abaixo.
        </p>
        <Button
          type="button"
          disabled={registrando || Math.round(totais.kcal) <= 0}
          onClick={() => void registrarSimulacaoNoDia()}
          className="shrink-0"
        >
          {registrando
            ? "Registrando…"
            : `Somar ${Math.round(totais.kcal).toLocaleString("pt-BR")} kcal em hoje`}
        </Button>
      </div>

      <div className="space-y-4">
        {rows.map((r, idx) => (
          <div
            key={r.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-neutral-950/80 p-4 lg:flex-row lg:flex-wrap lg:items-end"
          >
            <div className="min-w-[260px] flex-1 space-y-2 text-sm text-neutral-300 lg:min-w-[320px] lg:max-w-xl">
              <span className="block text-muted">Alimento</span>
              {r.foodId === CUSTOM_FOOD_ID ? (
                <p className="text-xs text-orange-200/90">
                  Modo manual — informe kcal/100 g ao lado.
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Selecionado:{" "}
                  <span className="font-medium text-neutral-200">
                    {presetById(r.foodId)?.nome ?? "—"} (~
                    {presetById(r.foodId)?.kcalPer100g ?? 0} kcal/100g)
                  </span>
                </p>
              )}
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500"
                  aria-hidden
                />
                <input
                  type="search"
                  autoComplete="off"
                  placeholder="Buscar: frango, aveia, chocolate…"
                  value={r.foodSearch}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === r.id ? { ...x, foodSearch: e.target.value } : x,
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground shadow-inner outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  aria-label="Buscar alimento na lista"
                />
              </div>
              <div
                className="max-h-52 overflow-y-auto rounded-lg border border-white/10 bg-black/50 shadow-inner"
                role="listbox"
                aria-label="Resultados da busca de alimentos"
              >
                {filterFoodPresets(r.foodSearch).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="option"
                    aria-selected={r.foodId === f.id}
                    onClick={() =>
                      setRows((prev) =>
                        prev.map((x) =>
                          x.id === r.id
                            ? { ...x, foodId: f.id, foodSearch: "" }
                            : x,
                        ),
                      )
                    }
                    className={cn(
                      "flex w-full items-baseline justify-between gap-2 border-b border-white/5 px-3 py-2.5 text-left text-sm transition last:border-b-0 hover:bg-white/10",
                      r.foodId === f.id && "bg-orange-500/15 text-orange-100",
                    )}
                  >
                    <span className="text-neutral-100">{f.nome}</span>
                    <span className="shrink-0 text-xs tabular-nums text-neutral-500">
                      {f.kcalPer100g} kcal/100g
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  role="option"
                  aria-selected={r.foodId === CUSTOM_FOOD_ID}
                  onClick={() =>
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === r.id
                          ? { ...x, foodId: CUSTOM_FOOD_ID, foodSearch: "" }
                          : x,
                      ),
                    )
                  }
                  className={cn(
                    "flex w-full border-t border-orange-500/30 px-3 py-2.5 text-left text-sm text-orange-200 transition hover:bg-orange-500/10",
                    r.foodId === CUSTOM_FOOD_ID && "bg-orange-500/20",
                  )}
                >
                  Outro alimento — informar kcal/100 g manualmente
                </button>
              </div>
              <p className="text-[11px] text-neutral-600">
                {r.foodSearch.trim()
                  ? `${filterFoodPresets(r.foodSearch).length} resultado(s) · até 100 itens`
                  : `Mostrando os primeiros 100 em ordem alfabética · digite para filtrar`}
              </p>
            </div>

            {r.foodId === CUSTOM_FOOD_ID ? (
              <div className="w-full min-w-[140px] max-w-xs flex-1">
                <Input
                  label="kcal / 100g"
                  inputMode="decimal"
                  placeholder="ex: 250"
                  value={r.customKcal100}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === r.id ? { ...x, customKcal100: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            ) : null}

            <div className="w-full min-w-[140px] max-w-[200px] flex-1">
              <Input
                label="Quantidade de porções"
                inputMode="decimal"
                placeholder="1"
                value={r.quantidade}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x) =>
                      x.id === r.id ? { ...x, quantidade: e.target.value } : x,
                    ),
                  )
                }
              />
            </div>

            <div className="w-full min-w-[140px] max-w-[200px] flex-1">
              <Input
                label="Peso (g) por porção"
                inputMode="decimal"
                placeholder="ex: 150"
                value={r.pesoGrams}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x) =>
                      x.id === r.id ? { ...x, pesoGrams: e.target.value } : x,
                    ),
                  )
                }
              />
            </div>

            <div className="flex w-full min-w-[200px] flex-1 flex-col gap-2 sm:flex-row sm:items-end lg:w-auto">
              <div className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm">
                <p className="text-xs text-neutral-500">Estimativa linha {idx + 1}</p>
                <p className="text-lg font-semibold tabular-nums text-orange-300">
                  {rowKcal(r).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} kcal
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-neutral-200 hover:bg-white/10 sm:shrink-0"
                aria-label={`Remover linha ${idx + 1}`}
                onClick={() =>
                  setRows((prev) => (prev.length <= 1 ? prev : prev.filter((x) => x.id !== r.id)))
                }
                disabled={rows.length <= 1}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={() => setRows((prev) => [...prev, newRow()])}
        className="gap-2"
      >
        <FontAwesomeIcon icon={faPlus} />
        Adicionar alimento
      </Button>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-neutral-950/80 p-4">
        <h2 className="text-sm font-semibold text-white">Histórico — últimos 28 dias</h2>
        <p className="text-xs text-neutral-500">
          “Na meta” = entre 90% e 110% da meta atual do professor. Valores antigos são comparados com a meta de hoje
          (referência simples).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-neutral-500">
                <th className="py-2 pr-3 font-medium">Data</th>
                <th className="py-2 pr-3 font-medium">kcal registradas</th>
                <th className="py-2 pr-3 font-medium">Meta (atual)</th>
                <th className="py-2 font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr key={h.dateKey} className="border-b border-white/5">
                  <td className="py-2.5 pr-3 text-neutral-200">{formatDateKeyPt(h.dateKey)}</td>
                  <td className="py-2.5 pr-3 tabular-nums text-neutral-300">
                    {h.total.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums text-neutral-500">
                    {metaDia != null ? metaDia.toLocaleString("pt-BR") : "—"}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        badgeClassDiaKcalStatus(h.status),
                      )}
                    >
                      {labelDiaKcalStatus(h.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-neutral-500">
        Valores meramente indicativos. Rotulagem oficial de embalagens e acompanhamento com nutricionista têm prioridade.
      </p>
    </div>
  );
}
