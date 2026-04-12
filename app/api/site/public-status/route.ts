import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/db/file-store";
import { isSitePublicOff } from "@/lib/platform/site-public-off";

/** Leitura leve para middleware (sem segredos). */
export async function GET() {
  const db = await readDatabase();
  return NextResponse.json({
    sitePublicoDesligado: isSitePublicOff(db),
  });
}
