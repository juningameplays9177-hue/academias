import { NextResponse } from "next/server";
import { readPlatformRegistry } from "@/lib/db/file-store";
import { isSitePublicOff } from "@/lib/platform/site-public-off";

/** Leitura leve para clientes / integrações (sem segredos). O proxy usa `readPlatformRegistry` direto. */
export async function GET() {
  const platform = await readPlatformRegistry();
  return NextResponse.json({
    sitePublicoDesligado: isSitePublicOff(platform),
  });
}
