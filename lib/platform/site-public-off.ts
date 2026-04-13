import type { AppDatabase } from "@/lib/db/types";

export function isSitePublicOff(
  db: Pick<AppDatabase, "platformSettings">,
): boolean {
  return Boolean(db.platformSettings?.sitePublicoDesligado);
}
