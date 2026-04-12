import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { readDatabase } from "@/lib/db/file-store";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const db = await readDatabase();
  const classes = db.classes.filter((c) => c.professorId === session.sub);
  return NextResponse.json({ classes });
}
