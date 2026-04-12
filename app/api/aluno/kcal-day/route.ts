import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/get-server-session";
import { mutateDatabase, readDatabase } from "@/lib/db/file-store";
import { brDateKey } from "@/lib/date/br-date-key";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ADD = 12_000;
const MAX_DAY_TOTAL = 20_000;

function findStudentIndex(
  db: { students: { id: string; email: string }[] },
  session: { sub: string; email: string },
) {
  return db.students.findIndex(
    (s) => s.id === session.sub || s.email.toLowerCase() === session.email.toLowerCase(),
  );
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.role !== "aluno") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    kcal?: number;
    dateKey?: string;
  };

  const kcal = Number(body.kcal);
  if (!Number.isFinite(kcal) || kcal <= 0 || kcal > MAX_ADD) {
    return NextResponse.json(
      { error: `Informe kcal entre 1 e ${MAX_ADD} para registrar.` },
      { status: 400 },
    );
  }

  const dateKey =
    typeof body.dateKey === "string" && DATE_KEY.test(body.dateKey)
      ? body.dateKey
      : brDateKey();

  const db0 = await readDatabase();
  if (findStudentIndex(db0, session) === -1) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
  }

  let limitHit = false;
  let totalDia = 0;

  await mutateDatabase((draft) => {
    const s = draft.students.find(
      (x) => x.id === session.sub || x.email.toLowerCase() === session.email.toLowerCase(),
    );
    if (!s) return;
    if (!s.consumoKcalPorDia) s.consumoKcalPorDia = {};
    const cur = s.consumoKcalPorDia[dateKey] ?? 0;
    const next = cur + Math.round(kcal);
    if (next > MAX_DAY_TOTAL) {
      limitHit = true;
      return;
    }
    s.consumoKcalPorDia[dateKey] = next;
    totalDia = next;
  });

  if (limitHit) {
    return NextResponse.json(
      { error: `Limite de ${MAX_DAY_TOTAL} kcal/dia no registro — confira os valores.` },
      { status: 400 },
    );
  }

  const fresh = await readDatabase();
  const st = fresh.students.find(
    (x) => x.id === session.sub || x.email.toLowerCase() === session.email.toLowerCase(),
  );
  const map = st?.consumoKcalPorDia ?? {};

  return NextResponse.json({
    ok: true,
    dateKey,
    totalDia: map[dateKey] ?? totalDia,
    consumoKcalPorDia: map,
  });
}
