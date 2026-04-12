/** Data civil no fuso de São Paulo (YYYY-MM-DD). */
const BR_TZ = "America/Sao_Paulo";

export function brDateKeyFromMs(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

export function brDateKey(d: Date = new Date()): string {
  return brDateKeyFromMs(d.getTime());
}

/** Soma dias a uma chave YYYY-MM-DD (calendário UTC simples — suficiente para histórico do app). */
export function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const u = Date.UTC(y, m - 1, d + deltaDays, 12, 0, 0);
  return brDateKeyFromMs(u);
}

/** Últimos N dias (incluindo hoje), do mais recente ao mais antigo. */
export function lastNBrDateKeys(n: number): string[] {
  const keys: string[] = [];
  let k = brDateKey();
  for (let i = 0; i < n; i++) {
    keys.push(k);
    k = addDaysToDateKey(k, -1);
  }
  return keys;
}

/** Ex.: 2026-04-12 → 12/04/2026 */
export function formatDateKeyPt(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}/${y}`;
}
