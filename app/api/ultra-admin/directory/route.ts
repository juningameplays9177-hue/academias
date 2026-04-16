import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { readDatabase } from "@/lib/db/file-store";
import {
  buildUnifiedDirectory,
  type DirectoryFilter,
} from "@/lib/ultra/directory";

export const maxDuration = 60;

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "ultra_admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const tipo = (searchParams.get("tipo") ?? "all") as DirectoryFilter;
  const filter: DirectoryFilter =
    tipo === "admin" || tipo === "professor" || tipo === "aluno" || tipo === "all"
      ? tipo
      : "all";

  const db = await readDatabase();
  return NextResponse.json({ accounts: buildUnifiedDirectory(db, filter) });
}
