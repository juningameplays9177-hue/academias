import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Checagem leve da origem. `buildId` ajuda a ver se HTML e `/_next/static/*` são do mesmo deploy.
 */
export async function GET() {
  let buildId: string | null = null;
  try {
    buildId = (
      await readFile(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8")
    ).trim();
  } catch {
    buildId = null;
  }
  return NextResponse.json({ ok: true, t: Date.now(), buildId });
}
