import type { AppDatabase } from "@/lib/db/types";

export function isSitePublicOff(db: AppDatabase): boolean {
  return Boolean(db.platformSettings?.sitePublicoDesligado);
}
