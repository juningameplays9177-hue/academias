import { NextResponse } from "next/server";
import { readPlatformRegistryPublic } from "@/lib/db/file-store";
import { isSitePublicOff } from "@/lib/platform/site-public-off";

/** Leitura leve para clientes / integrações (sem segredos). Preferimos `platform-public.json`. */
export async function GET() {
  const platform = await readPlatformRegistryPublic();
  return NextResponse.json({
    sitePublicoDesligado: isSitePublicOff(platform),
  });
}
