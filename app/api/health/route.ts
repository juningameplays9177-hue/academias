import { NextResponse } from "next/server";

/** Sem disco — útil para checar se a origem responde (evita confundir com 503 da CDN). */
export async function GET() {
  return NextResponse.json({ ok: true, t: Date.now() });
}
