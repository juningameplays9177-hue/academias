import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";
import { TENANT_COOKIE_NAME } from "@/lib/auth/tenant-cookie";
import { readPlatformRegistryPublic } from "@/lib/db/file-store";
import { isAcademiaPlataformaDesligada } from "@/lib/platform/academia-access";

/**
 * Compatível com clientes que consultam o status; o proxy lê `platform.json` diretamente.
 * Ultra Admin nunca é bloqueado por este flag.
 */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSessionPayload(token) : null;
  const tenantId = jar.get(TENANT_COOKIE_NAME)?.value ?? null;

  if (!tenantId || session?.role === "ultra_admin") {
    return NextResponse.json({ plataformaDesligada: false });
  }

  const platform = await readPlatformRegistryPublic();
  return NextResponse.json({
    plataformaDesligada: isAcademiaPlataformaDesligada(platform, tenantId),
  });
}
