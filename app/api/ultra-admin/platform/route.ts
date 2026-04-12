import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { isSitePublicOff } from "@/lib/platform/site-public-off";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  return NextResponse.json({
    sitePublicoDesligado: isSitePublicOff(db),
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as { sitePublicoDesligado?: boolean };
  if (typeof body.sitePublicoDesligado !== "boolean") {
    return NextResponse.json(
      { error: "Envie { sitePublicoDesligado: boolean }." },
      { status: 400 },
    );
  }

  await mutateDatabase((draft) => {
    draft.platformSettings = {
      ...draft.platformSettings,
      sitePublicoDesligado: body.sitePublicoDesligado,
    };
  });

  const db = await readDatabase();
  return NextResponse.json({
    ok: true,
    sitePublicoDesligado: isSitePublicOff(db),
  });
}
