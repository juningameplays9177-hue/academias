import type { AppDatabase } from "@/lib/db/types";

export function isSitePublicOff(
  db: Pick<AppDatabase, "platformSettings">,
): boolean {
  return db.platformSettings?.sitePublicoDesligado === true;
}
